// Tên file: CampaignFactory.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Campaign.sol"; // Import hợp đồng Campaign ở trên

contract CampaignFactory {
    
    // Mảng lưu lại địa chỉ của tất cả các chiến dịch đã tạo
    address[] public deployedCampaigns;
    
    event CampaignCreated(
        address indexed campaignAddress,
        address indexed owner,
        uint256 targetAmount,
        uint256 deadline
    );

    /**
     * @dev Tạo một chiến dịch gây quỹ mới
     * @param _owner Địa chỉ ví của người nhận tiền
     * @param _targetAmount Mục tiêu cần huy động (wei)
     * @param _durationInSeconds Thời hạn (tính bằng giây, ví dụ: 30 ngày = 2592000 giây)
     */
    function createCampaign(
        address payable _owner,
        uint256 _targetAmount,
        uint256 _durationInSeconds,
        string  memory campaignDescription
    ) public {
        
        // Tạo một hợp đồng Campaign mới
        Campaign newCampaign = new Campaign(
            _owner,
            _targetAmount,
            _durationInSeconds,
            campaignDescription
        );
        
        // Lưu lại địa chỉ của hợp đồng vừa tạo
        deployedCampaigns.push(address(newCampaign));
        
        emit CampaignCreated(
            address(newCampaign),
            _owner,
            _targetAmount,
            block.timestamp + _durationInSeconds
        );
    }
    
    /**
     * @dev Lấy danh sách tất cả các chiến dịch đã tạo
     */
    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}