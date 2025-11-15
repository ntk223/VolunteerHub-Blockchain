import React, { useState, useEffect, useMemo, useCallback } from 'react';
import contractService from '../../utils/contractService.js';

const CampaignStats = ({ campaign, progressPercentage, donorsCount = 0 }) => {

  const formattedDeadline = useMemo(() => {
    return new Date(parseInt(campaign.deadline) * 1000).toLocaleDateString('vi-VN');
  }, [campaign.deadline]);

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Thống kê</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tiến độ</span>
          <span className="font-semibold text-gray-800">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Đã gây quỹ</span>
          <span className="font-semibold text-gray-800">
            {parseFloat(campaign.totalRaised).toFixed(4)} ETH
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Mục tiêu</span>
          <span className="font-semibold text-gray-800">
            {parseFloat(campaign.targetAmount).toFixed(2)} ETH
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Hạn chót</span>
          <span className="font-semibold text-gray-800">
            {formattedDeadline}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Người đóng góp</span>
          <span className="font-semibold text-gray-800">
            {donorsCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CampaignStats);