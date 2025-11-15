import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import contractService from '../utils/contractService';
import toast from 'react-hot-toast';

// Tạo Context
const CampaignContext = createContext();

// Hook để sử dụng context
export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign phải được sử dụng trong CampaignProvider');
  }
  return context;
};

// Provider Component
export const CampaignProvider = ({ children }) => {
  const [campaigns, setCampaigns] = useState([]);
    const fetchCampaigns = useCallback(async () => {
    try {
      const campaignList = await contractService.getAllCampaigns();
      setCampaigns(campaignList);
    } catch (error) {
      console.error('Lỗi fetch campaigns:', error);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const getCampaignDetails = useCallback(async (address) => {
    try {
      const details = await contractService.getCampaignDetails(address);
      return details;
    } catch (error) {
      console.error('Lỗi lấy chi tiết campaign:', error);
      return null;
    }
  }, []);

  const createCampaign = useCallback(async (owner, targetAmount, durationInDays, campaignDescription) => {
    try {
      const tx = await contractService.createCampaign(owner, targetAmount, durationInDays, campaignDescription);
      toast.success('Campaign created successfully!');
      fetchCampaigns(); // Refresh the campaign list
      return true;
    } catch (error) {
      console.error('Lỗi tạo campaign:', error);
      toast.error('Failed to create campaign.');
      return false;
    }
  }, [fetchCampaigns]);

  const donate = useCallback(async (campaignAddress, amount) => {
    try {
        const tx = await contractService.donate(campaignAddress, amount);
        toast.success('Donation successful!');
        return true;
    } catch (error) {
      console.error('Lỗi khi donate:', error);
      toast.error('Failed to donate.');
      return false;
    }
  }, []);

  const contextValue = useMemo(() => ({
    campaigns,
    getCampaignDetails,
    createCampaign,
    donate,
    fetchCampaigns,
  }), [campaigns, getCampaignDetails, createCampaign, donate, fetchCampaigns]);

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  );
};
