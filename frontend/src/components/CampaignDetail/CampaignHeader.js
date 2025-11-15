import React, { useMemo } from 'react';
import { User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const CampaignHeader = ({ campaign, status }) => {
  const { formatAddress } = useAuth();
  
  const statusIcon = useMemo(() => {
    const iconProps = { className: `w-5 h-5` };
    
    switch (status.color) {
      case 'green':
        return <CheckCircle {...iconProps} className="w-5 h-5 text-green-500" />;
      case 'red':
        return <XCircle {...iconProps} className="w-5 h-5 text-red-500" />;
      default:
        return <Clock {...iconProps} className="w-5 h-5 text-blue-500" />;
    }
  }, [status.color]);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Campaign của {formatAddress(campaign.owner)}
            </h1>
            <p className="text-gray-600">
              Địa chỉ: {formatAddress(campaign.address)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {statusIcon}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.color === 'green' ? 'status-successful' :
            status.color === 'red' ? 'status-failed' :
            'status-active'
          }`}>
            {status.text}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả dự án</h3>
        <p className="text-gray-700 leading-relaxed">
          {campaign.description || 'Không có mô tả cho campaign này.'}
        </p>
      </div>
    </div>
  );
};

export default React.memo(CampaignHeader);