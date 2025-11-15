import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const CampaignOwnerInfo = ({ campaign }) => {
  const { account, formatAddress } = useAuth();

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin chủ dự án</h3>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-gray-800">{formatAddress(campaign.owner)}</p>
          <p className="text-sm text-gray-600">Chủ sở hữu</p>
        </div>
      </div>
      
      {account === campaign.owner && (
        <div className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 border border-[#667eea]/30 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-gray-700 text-sm">
            🎉 Đây là campaign của bạn!
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(CampaignOwnerInfo);