import React, { useState, useEffect } from 'react';
import CreateCampaign from '../components/Main/CreateCampaign.js';
import {useCampaign } from '../hooks/useCampaign.js';
import { useGlobalCampaignEvents } from '../hooks/useEvents.js';
import Header from '../components/Header/Header.js';
import Footer from '../components/Footer/Footer.js';
import CampaignList from '../components/Main/CampaignList.js';
import ActionButton from '../components/Main/ActionButton.js';
import Introduce from '../components/Main/Introduce.js';
// import Statistic from '../components/layout/Statistic.js';
const CampaignPage = () => {
  const [loading, setLoading] = useState(false);
  const {
    campaigns,
    fetchCampaigns
  } = useCampaign();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Global event listening
  const { addCampaignListener } = useGlobalCampaignEvents();

  // Thêm listeners cho tất cả campaigns khi load
  useEffect(() => {
    if (campaigns.length > 0) {
      campaigns.forEach(campaign => {
        if (campaign.address) {
          addCampaignListener(campaign.address);
        }
      });
    }
  }, [campaigns, addCampaignListener]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container py-8">
        {/* Welcome Section */}
        <Introduce/>

        {/* Statistics */}
        {/* <Statistic stats={stats} /> */}

        {/* Action Buttons */}
        <ActionButton loading={loading} setShowCreateForm={setShowCreateForm} fetchCampaigns={fetchCampaigns} />

        {/* Campaigns Grid */}
        <CampaignList campaigns={campaigns} loading={loading}/>
      </main>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <CreateCampaign onClose={() => setShowCreateForm(false)}/>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CampaignPage;