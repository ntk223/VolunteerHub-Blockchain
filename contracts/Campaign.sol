// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Campaign (DAO-style Crowdfunding)
 * @dev Hợp đồng gây quỹ minh bạch với cơ chế bỏ phiếu phê duyệt chi tiêu.
 */
contract Campaign {
    // --- Biến Trạng thái (State Variables) ---
    address payable public immutable owner;   // Người hưởng thụ (người nhận tiền)
    uint256 public immutable targetAmount;          // Mục tiêu cần đạt
    uint256 public immutable deadline;              // Thời điểm kết thúc chiến dịch
    uint256 public totalRaised;                     // Tổng số tiền đã huy động
    string public campaignDescription;        // Mô tả chiến dịch
    uint256 public createdAt;                      // Thời điểm tạo chiến dịch
    

    // Danh sách người donate & số tiền họ đóng góp
    address[] public donors;
    mapping(address => uint256) public contributions;

    // --- Cấu trúc Đề xuất chi tiêu (Proposal Struct) ---
    struct Proposal {
        uint256 id;
        string description;          // Mô tả đề xuất
        uint256 amount;              // Số tiền cần chi
        address payable recipient;   // Người nhận tiền
        uint256 voteYes;             // Tổng số phiếu ủng hộ (tính theo số tiền donate)
        uint256 voteNo;              // Tổng số phiếu phản đối
        bool executed;               // Đề xuất đã được thực hiện hay chưa
        mapping(address => bool) voted; // Tránh double-vote
    }

    // Lưu các proposal
    mapping(uint256 => Proposal) private proposals;
    uint256 public nextProposalId;

    // --- Events ---
    event Donated(address indexed donor, uint256 amount);
    event Refunded(address indexed donor, uint256 amount);
    event ProposalCreated(uint256 id, string description, uint256 amount, address recipient);
    event Voted(address indexed voter, uint256 proposalId, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, uint256 amount, address recipient);

    // --- Constructor ---
    constructor(
        address payable _owner,
        uint256 _target,
        uint256 _durationInSeconds,
        string  memory _campaignDescription
    ) {
        owner = _owner;
        targetAmount = _target;
        deadline = block.timestamp + _durationInSeconds;
        campaignDescription = _campaignDescription;
        createdAt = block.timestamp;
    }

    // --- 1. Donate ---
    function donate() external payable {
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Must send ETH");

        if (contributions[msg.sender] == 0) {
            donors.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        emit Donated(msg.sender, msg.value);
    }

    // --- 2. Hoàn tiền nếu thất bại ---
    function refund() external {
        require(block.timestamp >= deadline, "Campaign not ended yet");
        require(totalRaised < targetAmount, "Campaign successful");
        
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Refund failed");

        emit Refunded(msg.sender, amount);
    }

    // --- 3. Tạo đề xuất chi tiêu ---
    function createProposal(
        string calldata _description,
        uint256 _amount,
        address payable _recipient
    ) external {
        require(msg.sender == owner, "Only owner can propose");
        require(_amount <= address(this).balance, "Not enough funds");

        Proposal storage p = proposals[nextProposalId];
        p.id = nextProposalId;
        p.description = _description;
        p.amount = _amount;
        p.recipient = _recipient;

        emit ProposalCreated(nextProposalId, _description, _amount, _recipient);
        nextProposalId++;
    }

    // --- 4. Bỏ phiếu cho đề xuất ---
    function vote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];

        require(contributions[msg.sender] > 0, "Only donors can vote");
        require(!p.voted[msg.sender], "Already voted");
        require(!p.executed, "Proposal executed");

        uint256 weight = contributions[msg.sender];
        p.voted[msg.sender] = true;

        if (support) {
            p.voteYes += weight;
        } else {
            p.voteNo += weight;
        }

        emit Voted(msg.sender, proposalId, support, weight);
    }

    // --- 5. Thực hiện đề xuất nếu được thông qua ---
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];

        require(!p.executed, "Already executed");
        require(p.voteYes > p.voteNo, "Proposal not approved");
        require(p.amount <= address(this).balance, "Insufficient funds");

        p.executed = true;

        (bool success, ) = p.recipient.call{value: p.amount}("");
        require(success, "Transfer failed");

        emit ProposalExecuted(proposalId, p.amount, p.recipient);
    }

    // --- View functions (tiện ích) ---
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getDonorCount() external view returns (uint256) {
        return donors.length;
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            string memory description,
            uint256 amount,
            address recipient,
            uint256 voteYes,
            uint256 voteNo,
            bool executed
        )
    {
        Proposal storage p = proposals[proposalId];
        return (p.description, p.amount, p.recipient, p.voteYes, p.voteNo, p.executed);
    }
}
