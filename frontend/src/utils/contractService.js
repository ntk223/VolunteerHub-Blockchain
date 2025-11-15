import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CAMPAIGN_FACTORY_ABI, CAMPAIGN_ABI } from './constants';

class ContractService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.factoryContract = null;
    this.isInitialized = false;
  }

  // Khởi tạo connection với MetaMask
  async init() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask không được cài đặt! Vui lòng cài đặt MetaMask extension.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Kiểm tra network
      const network = await this.provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId.toString());
      
      this.factoryContract = new ethers.Contract(
        CONTRACT_ADDRESSES.CAMPAIGN_FACTORY,
        CAMPAIGN_FACTORY_ABI,
        this.signer
      );

      this.isInitialized = true;
      const address = await this.signer.getAddress();
      console.log('ContractService initialized with address:', address);
      return address;
    } catch (error) {
      console.error('Lỗi khởi tạo ContractService:', error);
      throw new Error(`Không thể kết nối: ${error.message}`);
    }
  }

  // Đảm bảo đã khởi tạo
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  // Lấy thông tin account
  async getAccount() {
    await this.ensureInitialized();
    return await this.signer.getAddress();
  }

  // Lấy balance của account
  async getBalance(address) {
    await this.ensureInitialized();
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Tạo campaign mới
  async createCampaign(owner, targetAmount, durationInDays, campaignDescription) {
    try {
      await this.ensureInitialized();
      
      console.log('Creating campaign:', { owner, targetAmount, durationInDays, campaignDescription });
      
      const targetInWei = ethers.parseEther(targetAmount.toString());
      const durationInSeconds = durationInDays * 24 * 60 * 60;
      
      console.log('Calling factory.createCampaign with:', {
        owner,
        targetInWei: targetInWei.toString(),
        durationInSeconds,
        campaignDescription
      });
      
      const tx = await this.factoryContract.createCampaign(
        owner,
        targetInWei,
        durationInSeconds,
        campaignDescription
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return tx;
    } catch (error) {
      console.error('Lỗi tạo campaign:', error);
      throw new Error(`Không thể tạo campaign: ${error.message}`);
    }
  }

  // Lấy tất cả campaigns
  async getAllCampaigns() {
    try {
      await this.ensureInitialized();
      
      console.log('Fetching deployed campaigns...');
      const campaignAddresses = await this.factoryContract.getDeployedCampaigns();
      console.log('Found campaigns:', campaignAddresses);
      
      const campaigns = [];
      
      for (let address of campaignAddresses) {
        try {
          const campaignData = await this.getCampaignDetails(address);
          campaigns.push({ address, ...campaignData });
        } catch (error) {
          console.error(`Lỗi load campaign ${address}:`, error);
          // Skip campaign này và tiếp tục với campaign khác
        }
      }
      
      console.log('Loaded campaigns:', campaigns);
      return campaigns;
    } catch (error) {
      console.error('Lỗi load campaigns:', error);
      throw new Error(`Không thể tải campaigns: ${error.message}`);
    }
  }

  // Lấy chi tiết 1 campaign
  async getCampaignDetails(address) {
    try {
      await this.ensureInitialized();
      
      console.log(`Getting campaign details for: ${address}`);
      const campaign = new ethers.Contract(address, CAMPAIGN_ABI, this.provider);
      
      const [owner, targetAmount, deadline, totalRaised, balance, campaignDescription, createdAt] = await Promise.all([
        campaign.owner(),
        campaign.targetAmount(),
        campaign.deadline(),
        campaign.totalRaised(),
        campaign.getBalance(),
        campaign.campaignDescription(),
        campaign.createdAt()
      ]);
      
      console.log('Campaign raw data:', {
        owner,
        targetAmount: targetAmount.toString(),
        deadline: deadline.toString(),
        totalRaised: totalRaised.toString(),
        balance: balance.toString()
      });
      
      const now = Math.floor(Date.now() / 1000);
      const isActive = now < Number(deadline);
      const isSuccessful = Number(totalRaised) >= Number(targetAmount);
      
      let status;
      if (isActive) {
        status = 'active';
      } else if (isSuccessful) {
        status = 'successful';
      } else {
        status = 'failed';
      }
      
      const campaignData = {
        owner,
        targetAmount: ethers.formatEther(targetAmount),
        deadline: Number(deadline),
        totalRaised: ethers.formatEther(totalRaised),
        balance: ethers.formatEther(balance),
        isActive,
        isSuccessful,
        status,
        progress: (Number(ethers.formatEther(totalRaised)) / Number(ethers.formatEther(targetAmount))) * 100
      };
      
      console.log('Processed campaign data:', campaignData);
      return campaignData;
    } catch (error) {
      console.error(`Lỗi load campaign details ${address}:`, error);
      throw new Error(`Không thể load campaign: ${error.message}`);
    }
  }

  // Quyên góp vào campaign
// Quyên góp vào campaign
async donate(campaignAddress, amount) {
  try {
    await this.ensureInitialized();

    console.log('Donating:', { campaignAddress, amount });

    const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.signer);
    const amountInWei = ethers.parseEther(amount.toString());

    // Kiểm tra balance trước khi donate
    const userAddress = await this.signer.getAddress();
    const userBalance = await this.provider.getBalance(userAddress);

    if (userBalance < amountInWei) {
      throw new Error('Số dư không đủ để thực hiện giao dịch');
    }

    // Gọi trực tiếp transaction với gasLimit, tránh eth_call estimate
    const tx = await campaign.donate({
      value: amountInWei,
      gasLimit: 300_000n // hoặc tăng lên nếu donate nhiều hơn
    });

    console.log('Donate transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Donate transaction confirmed:', receipt);

    return tx;
  } catch (error) {
    console.error('Lỗi quyên góp:', error);

    // Parse error messages thân thiện
    let errorMessage = error.message;
    if (error.message.includes('Campaign ended')) {
      errorMessage = 'Campaign đã kết thúc, không thể quyên góp';
    } else if (error.message.includes('Must send ETH')) {
      errorMessage = 'Số tiền quyên góp phải lớn hơn 0';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Số dư không đủ để thực hiện giao dịch';
    } else if (error.message.includes('user rejected')) {
      errorMessage = 'Giao dịch bị từ chối bởi người dùng';
    }

    throw new Error(errorMessage);
  }
}



  // Tạo proposal (thay thế withdrawFunds)
  async createProposal(campaignAddress, description, amount, recipient) {
    try {
      await this.ensureInitialized();
      
      console.log('Creating proposal:', { campaignAddress, description, amount, recipient });
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.signer);
      const amountInWei = ethers.parseEther(amount.toString());
      
      const tx = await campaign.createProposal(description, amountInWei, recipient);
      console.log('Proposal transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Proposal transaction confirmed:', receipt);
      
      return tx;
    } catch (error) {
      console.error('Lỗi tạo proposal:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Only owner can propose')) {
        errorMessage = 'Chỉ owner mới có thể tạo proposal';
      } else if (error.message.includes('Not enough funds')) {
        errorMessage = 'Campaign không có đủ tiền cho proposal này';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Bỏ phiếu cho proposal
  async vote(campaignAddress, proposalId, support) {
    try {
      await this.ensureInitialized();
      
      console.log('Voting on proposal:', { campaignAddress, proposalId, support });
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.signer);
      const tx = await campaign.vote(proposalId, support);
      
      console.log('Vote transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Vote transaction confirmed:', receipt);
      
      return tx;
    } catch (error) {
      console.error('Lỗi vote:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Only donors can vote')) {
        errorMessage = 'Chỉ những người đã quyên góp mới có thể vote';
      } else if (error.message.includes('Already voted')) {
        errorMessage = 'Bạn đã vote cho proposal này rồi';
      } else if (error.message.includes('Proposal executed')) {
        errorMessage = 'Proposal này đã được thực hiện';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Thực hiện proposal
  async executeProposal(campaignAddress, proposalId) {
    try {
      await this.ensureInitialized();
      
      console.log('Executing proposal:', { campaignAddress, proposalId });
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.signer);
      const tx = await campaign.executeProposal(proposalId);
      
      console.log('Execute proposal transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Execute proposal transaction confirmed:', receipt);
      
      return tx;
    } catch (error) {
      console.error('Lỗi execute proposal:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Already executed')) {
        errorMessage = 'Proposal này đã được thực hiện rồi';
      } else if (error.message.includes('Proposal not approved')) {
        errorMessage = 'Proposal chưa được chấp thuận (cần nhiều vote YES hơn)';
      } else if (error.message.includes('Insufficient funds')) {
        errorMessage = 'Campaign không còn đủ tiền để thực hiện proposal';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Hoàn tiền (cho donors)
  async refund(campaignAddress) {
    try {
      await this.ensureInitialized();
      
      console.log('Processing refund for campaign:', campaignAddress);
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.signer);
      const tx = await campaign.refund();
      
      console.log('Refund transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Refund transaction confirmed:', receipt);
      
      return tx;
    } catch (error) {
      console.error('Lỗi hoàn tiền:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('Campaign not ended yet')) {
        errorMessage = 'Campaign chưa kết thúc, chưa thể hoàn tiền';
      } else if (error.message.includes('Campaign successful')) {
        errorMessage = 'Campaign thành công, không thể hoàn tiền';
      } else if (error.message.includes('Nothing to refund')) {
        errorMessage = 'Bạn chưa quyên góp vào campaign này';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Lấy contribution của user
  async getUserContribution(campaignAddress, userAddress) {
    try {
      await this.ensureInitialized();
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      const contribution = await campaign.contributions(userAddress);
      return ethers.formatEther(contribution);
    } catch (error) {
      console.error('Lỗi lấy contribution:', error);
      return '0';
    }
  }
  // Lấy danh sách donors
  async getDonors(campaignAddress) {
    try {
      await this.ensureInitialized();
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      const donorCount = await campaign.getDonorCount();
      
      // Lấy contributions của từng donor
      const donorDetails = [];
      for (let i = 0; i < donorCount; i++) {
        const donorAddress = await campaign.donors(i);
        const contribution = await campaign.contributions(donorAddress);
        donorDetails.push({
          address: donorAddress,
          contribution: ethers.formatEther(contribution)
        });
      }
      
      return donorDetails;
    } catch (error) {
      console.error('Lỗi lấy danh sách donors:', error);
      return [];
    }
  }

  // Lấy thông tin proposal
  async getProposal(campaignAddress, proposalId) {
    try {
      await this.ensureInitialized();
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      const proposal = await campaign.getProposal(proposalId);
      
      return {
        description: proposal[0],
        amount: ethers.formatEther(proposal[1]),
        recipient: proposal[2],
        voteYes: ethers.formatEther(proposal[3]),
        voteNo: ethers.formatEther(proposal[4]),
        executed: proposal[5]
      };
    } catch (error) {
      console.error('Lỗi lấy proposal:', error);
      throw new Error(`Không thể lấy thông tin proposal: ${error.message}`);
    }
  }

  // Lấy số lượng proposal
  async getProposalCount(campaignAddress) {
    try {
      await this.ensureInitialized();
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      const count = await campaign.nextProposalId();
      return Number(count);
    } catch (error) {
      console.error('Lỗi lấy số proposal:', error);
      return 0;
    }
  }

  // --- EVENT LISTENERS ---

  // Lắng nghe sự kiện Donated sử dụng polling
  listenToDonated(campaignAddress, callback) {
    try {
      let lastBlockNumber = 0;
      let isActive = true;
      
      const pollForEvents = async () => {
        if (!isActive) return;
        
        try {
          const currentBlock = await this.provider.getBlockNumber();
          if (lastBlockNumber === 0) {
            lastBlockNumber = currentBlock - 10; // Bắt đầu từ 10 blocks trước
          }
          
          if (currentBlock > lastBlockNumber) {
            const events = await this.getPastEvents(campaignAddress, 'Donated', lastBlockNumber + 1);
            events.forEach(event => callback(event));
            lastBlockNumber = currentBlock;
          }
        } catch (error) {
          console.error('Error polling for Donated events:', error);
        }
        
        if (isActive) {
          setTimeout(pollForEvents, 5000); // Poll mỗi 5 giây
        }
      };

      pollForEvents();
      
      return () => {
        isActive = false;
      };
    } catch (error) {
      console.error('Lỗi listen Donated:', error);
      return () => {};
    }
  }

  // Lắng nghe sự kiện ProposalCreated
  listenToProposalCreated(campaignAddress, callback) {
    try {
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      
      campaign.on('ProposalCreated', (id, description, amount, recipient, event) => {
        console.log('ProposalCreated event:', { 
          id: Number(id), 
          description, 
          amount: ethers.formatEther(amount), 
          recipient,
          txHash: event.log.transactionHash 
        });
        callback({
          type: 'proposalCreated',
          id: Number(id),
          description,
          amount: ethers.formatEther(amount),
          recipient,
          txHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });

      return () => campaign.removeAllListeners('ProposalCreated');
    } catch (error) {
      console.error('Lỗi listen ProposalCreated:', error);
      return () => {};
    }
  }

  // Lắng nghe sự kiện Voted
  listenToVoted(campaignAddress, callback) {
    try {
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      
      campaign.on('Voted', (voter, proposalId, support, weight, event) => {
        console.log('Voted event:', { 
          voter, 
          proposalId: Number(proposalId), 
          support, 
          weight: ethers.formatEther(weight),
          txHash: event.log.transactionHash 
        });
        callback({
          type: 'voted',
          voter,
          proposalId: Number(proposalId),
          support,
          weight: ethers.formatEther(weight),
          txHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });

      return () => campaign.removeAllListeners('Voted');
    } catch (error) {
      console.error('Lỗi listen Voted:', error);
      return () => {};
    }
  }

  // Lắng nghe sự kiện ProposalExecuted
  listenToProposalExecuted(campaignAddress, callback) {
    try {
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      
      campaign.on('ProposalExecuted', (proposalId, amount, recipient, event) => {
        console.log('ProposalExecuted event:', { 
          proposalId: Number(proposalId), 
          amount: ethers.formatEther(amount), 
          recipient,
          txHash: event.log.transactionHash 
        });
        callback({
          type: 'proposalExecuted',
          proposalId: Number(proposalId),
          amount: ethers.formatEther(amount),
          recipient,
          txHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });

      return () => campaign.removeAllListeners('ProposalExecuted');
    } catch (error) {
      console.error('Lỗi listen ProposalExecuted:', error);
      return () => {};
    }
  }

  // Lắng nghe sự kiện Refunded
  listenToRefunded(campaignAddress, callback) {
    try {
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      
      campaign.on('Refunded', (donor, amount, event) => {
        console.log('Refunded event:', { donor, amount: ethers.formatEther(amount), txHash: event.log.transactionHash });
        callback({
          type: 'refunded',
          donor,
          amount: ethers.formatEther(amount),
          txHash: event.log.transactionHash,
          blockNumber: event.log.blockNumber
        });
      });

      return () => campaign.removeAllListeners('Refunded');
    } catch (error) {
      console.error('Lỗi listen Refunded:', error);
      return () => {};
    }
  }

  // Lắng nghe TẤT CẢ sự kiện của một campaign sử dụng polling
  listenToAllEvents(campaignAddress, callback) {
    let lastBlockNumber = 0;
    let isActive = true;
    
    const eventTypes = ['Donated', 'ProposalCreated', 'Voted', 'ProposalExecuted', 'Refunded'];
    
    const pollForAllEvents = async () => {
      if (!isActive) return;
      
      try {
        const currentBlock = await this.provider.getBlockNumber();
        if (lastBlockNumber === 0) {
          lastBlockNumber = currentBlock - 5; // Bắt đầu từ 5 blocks trước
          console.log(`📡 Starting event polling for ${campaignAddress} from block ${lastBlockNumber}`);
        }
        
        if (currentBlock > lastBlockNumber) {
          // Poll tất cả event types
          for (const eventType of eventTypes) {
            try {
              const events = await this.getPastEvents(campaignAddress, eventType, lastBlockNumber + 1);
              events.forEach(event => callback(event));
            } catch (error) {
              console.error(`Error polling ${eventType} events:`, error);
            }
          }
          lastBlockNumber = currentBlock;
        }
      } catch (error) {
        console.error('Error polling for events:', error);
      }
      
      if (isActive) {
        setTimeout(pollForAllEvents, 5000); // Poll mỗi 5 giây để giảm tải
      }
    };

    pollForAllEvents();

    // Trả về hàm để stop polling
    return () => {
      isActive = false;
    };
  }

  // Lấy events đã qua (từ block cũ)
  async getPastEvents(campaignAddress, eventName, fromBlock = 0) {
    try {
      await this.ensureInitialized();
      
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      
      const filter = campaign.filters[eventName]();
      const events = await campaign.queryFilter(filter, fromBlock);
      
      const parsedEvents = events.map(event => {
        const parsed = campaign.interface.parseLog(event);
        
        // Format theo từng loại event như callback expect
        switch (eventName) {
          case 'Donated':
            return {
              type: 'donated',
              donor: parsed.args.donor,
              amount: ethers.formatEther(parsed.args.amount),
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber
            };
          case 'ProposalCreated':
            return {
              type: 'proposalCreated',
              proposalId: parsed.args.proposalId.toString(),
              description: parsed.args.description,
              recipient: parsed.args.recipient,
              amount: ethers.formatEther(parsed.args.amount),
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber
            };
          case 'Voted':
            return {
              type: 'voted',
              proposalId: parsed.args.proposalId.toString(),
              voter: parsed.args.voter,
              support: parsed.args.support,
              weight: ethers.formatEther(parsed.args.weight),
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber
            };
          case 'ProposalExecuted':
            return {
              type: 'proposalExecuted',
              proposalId: parsed.args.proposalId.toString(),
              recipient: parsed.args.recipient,
              amount: ethers.formatEther(parsed.args.amount),
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber
            };
          case 'Refunded':
            return {
              type: 'refunded',
              donor: parsed.args.donor,
              amount: ethers.formatEther(parsed.args.amount),
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber
            };
          default:
            return {
              type: eventName.toLowerCase(),
              args: parsed.args,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber
            };
        }
      });

      console.log(`Past ${eventName} events:`, parsedEvents);
      return parsedEvents;
    } catch (error) {
      console.error(`Lỗi lấy past ${eventName} events:`, error);
      return [];
    }
  }

  // Dừng tất cả listeners
  removeAllListeners(campaignAddress) {
    try {
      const campaign = new ethers.Contract(campaignAddress, CAMPAIGN_ABI, this.provider);
      campaign.removeAllListeners();
      console.log(`Removed all listeners for campaign: ${campaignAddress}`);
    } catch (error) {
      console.error('Lỗi remove listeners:', error);
    }
  }
}

export default new ContractService();