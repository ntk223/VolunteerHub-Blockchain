import React from 'react';
import { Clock, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const DonationSidebar = ({ campaign, status, timeRemaining, onDonate, donating }) => {
  const { account } = useAuth();

  if (status.status !== 'active') return null;

  return (
    <div className="card">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Đóng góp cho dự án</h3>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Còn lại: {timeRemaining}</span>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">
            {(parseFloat(campaign.targetAmount) - parseFloat(campaign.totalRaised)).toFixed(4)} ETH
          </p>
          <p className="text-sm text-gray-600">cần để đạt mục tiêu</p>
        </div>
      </div>

      {account ? (
        <button
          onClick={onDonate}
          disabled={donating}
          className="w-full btn btn-primary disabled:opacity-50"
        >
          <Heart className="w-5 h-5" />
          {donating ? 'Đang xử lý...' : 'Đóng góp ngay'}
        </button>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">Kết nối ví để đóng góp</p>
          <button className="w-full btn btn-secondary">
            Kết nối ví
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(DonationSidebar);