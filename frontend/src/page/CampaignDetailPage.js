import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

// Import hooks
import { useCampaign } from '../hooks/useCampaign.js';
import { useAuth } from '../hooks/useAuth.js';
import { useEvents } from '../hooks/useEvents.js';

// Import layout components
import Header from '../components/Header/Header.js';
import Footer from '../components/Footer/Footer.js';

// Import detail components
import CampaignHeader from '../components/CampaignDetail/CampaignHeader.js';
import CampaignProgress from '../components/CampaignDetail/CampaignProgress.js';
import CampaignTabs from '../components/CampaignDetail/CampaignTabs.js';
import CampaignOverview from '../components/CampaignDetail/CampaignOverview.js';
import CampaignProposals from '../components/CampaignDetail/CampaignProposals.js';
import DonorsList from '../components/CampaignDetail/DonorsList.js';
import EventFeed from '../components/CampaignDetail/EventFeed.js';
import DonationSidebar from '../components/CampaignDetail/DonationSidebar.js';
import CampaignStats from '../components/CampaignDetail/CampaignStats.js';
import CampaignOwnerInfo from '../components/CampaignDetail/CampaignOwnerInfo.js';
import CampaignDetailLoading from '../components/CampaignDetail/CampaignDetailLoading.js';
import CampaignNotFound from '../components/CampaignDetail/CampaignNotFound.js';

// Import modal components
import DonateForm from '../components/Main/DonateForm.js';
import CreateProposal from '../components/Main/CreateProposal.js';
import contractService from '../utils/contractService.js';

const CampaignDetailPage = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const { account } = useAuth();
  const { getCampaignDetails, donate } = useCampaign();
  
  // State management
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [donating, setDonating] = useState(false);
  const [donors, setDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(false);

  // Event listening
  const { 
    events, 
    isListening, 
    loadPastEvents, 
    clearEvents 
  } = useEvents(address);

  // Functions - Sử dụng useCallback để tránh re-render
  const loadCampaignDetails = useCallback(async () => {
    console.log('📝 Loading campaign details for:', address);
    try {
      setLoading(true);
      const details = await getCampaignDetails(address);
      if (details) {
        setCampaign({ ...details, address });
        console.log('✅ Campaign loaded successfully:', details.owner);
      } else {
        toast.error('Không tìm thấy campaign');
        navigate('/');
      }
    } catch (error) {
      console.error('Lỗi tải chi tiết campaign:', error);
      toast.error('Lỗi tải thông tin campaign');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [address, getCampaignDetails, navigate]);

  // Computed values - Sử dụng useMemo để cache calculations
  const progressPercentage = useMemo(() => {
    if (!campaign) return 0;
    const percentage = (parseFloat(campaign.totalRaised) / parseFloat(campaign.targetAmount)) * 100;
    return Math.min(percentage, 100);
  }, [campaign?.totalRaised, campaign?.targetAmount]);

  const status = useMemo(() => {
    if (!campaign) return { status: 'loading', color: 'gray', text: 'Đang tải...' };
    
    const now = Date.now() / 1000;
    const deadline = parseInt(campaign.deadline);
    const targetAmount = parseFloat(campaign.targetAmount);
    const totalRaised = parseFloat(campaign.totalRaised);

    if (totalRaised >= targetAmount) {
      return { status: 'success', color: 'green', text: 'Thành công' };
    } else if (now > deadline) {
      return { status: 'failed', color: 'red', text: 'Thất bại' };
    } else {
      return { status: 'active', color: 'blue', text: 'Đang hoạt động' };
    }
  }, [campaign?.deadline, campaign?.targetAmount, campaign?.totalRaised]);

  const timeRemaining = useMemo(() => {
    if (!campaign) return '';
    
    const now = Date.now() / 1000;
    const deadline = parseInt(campaign.deadline);
    const timeLeft = deadline - now;

    if (timeLeft <= 0) return 'Đã hết hạn';

    const days = Math.floor(timeLeft / (24 * 3600));
    const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
    
    // Chỉ hiển thị phút nếu còn ít hơn 1 giờ để tránh update quá thường xuyên
    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ`;
    
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${minutes} phút`;
  }, [campaign?.deadline]);

  const loadDonors = useCallback(async () => {
    if (!address) return;
    
    try {
      setDonorsLoading(true);
      const donorsList = await contractService.getDonors(address);
      setDonors(donorsList);
    } catch (error) {
      console.error('Lỗi tải danh sách donors:', error);
      setDonors([]);
    } finally {
      setDonorsLoading(false);
    }
  }, [address]);

  const handleDonate = useCallback(async (amount) => {
    if (!account) {
      toast.error('Vui lòng kết nối ví trước');
      return;
    }

    try {
      setDonating(true);
      const success = await donate(address, amount);
      if (success) {
        setShowDonateForm(false);
        await Promise.all([
          loadCampaignDetails(),
          loadDonors()
        ]); // Reload cả campaign và donors
      }
    } catch (error) {
      console.error('Lỗi donate:', error);
    } finally {
      setDonating(false);
    }
  }, [account, donate, address, loadCampaignDetails, loadDonors]);

  // Effects - Đặt sau khi tất cả functions được định nghĩa
  useEffect(() => {
    console.log('🔄 CampaignDetailPage: Loading data for address:', address);
    if (address) {
      loadCampaignDetails();
      loadDonors();
    }
  }, [address]); // Chỉ chạy khi address thay đổi

  // Render conditions
  if (loading) {
    return <CampaignDetailLoading />;
  }

  if (!campaign) {
    return <CampaignNotFound />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Info - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <CampaignHeader campaign={campaign} status={status} />

            {/* Progress */}
            <CampaignProgress 
              campaign={campaign} 
              progressPercentage={progressPercentage}
              status={status}
            />

            {/* Tabs */}
            <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab}>
              {activeTab === 'overview' && (
                <CampaignOverview 
                  campaign={campaign} 
                  timeRemaining={timeRemaining}
                />
              )}
              
              {activeTab === 'proposals' && (
                <CampaignProposals 
                  campaign={campaign} 
                  status={status}
                  onCreateProposal={() => setShowCreateProposal(true)}
                />
              )}
              
              {activeTab === 'donors' && (
                <DonorsList donors={donors} loading={donorsLoading} />
              )}
              
              {activeTab === 'events' && (
                <EventFeed 
                  events={events}
                  isListening={isListening}
                  onLoadPastEvents={loadPastEvents}
                  onClearEvents={clearEvents}
                />
              )}
            </CampaignTabs>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Donation Card */}
            <DonationSidebar 
              campaign={campaign}
              status={status}
              timeRemaining={timeRemaining}
              onDonate={() => setShowDonateForm(true)}
              donating={donating}
            />

            {/* Campaign Stats */}
            <CampaignStats 
              campaign={campaign}
              progressPercentage={progressPercentage}
              donorsCount={donors.length}
            />

            {/* Owner Info */}
            <CampaignOwnerInfo campaign={campaign} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDonateForm && (
        <DonateForm 
          campaignAddress={address}
          onClose={() => setShowDonateForm(false)}
          onDonate={handleDonate}
        />
      )}

      {showCreateProposal && (
        <CreateProposal 
          campaignAddress={address}
          onClose={() => setShowCreateProposal(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default React.memo(CampaignDetailPage);