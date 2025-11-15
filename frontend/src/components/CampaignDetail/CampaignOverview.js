import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const CampaignOverview = React.memo(({ campaign, timeRemaining }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Ngày tạo</p>
            <p className="font-medium">
              Thêm mới ngày tạo ở đây
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Thời gian còn lại</p>
            <p className="font-medium">{timeRemaining}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-800 mb-2">Chi tiết hợp đồng</h4>
        <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-sm text-gray-600">Địa chỉ hợp đồng:</p>
          <p className="font-mono text-sm bg-white/50 px-3 py-2 rounded border border-white/30 break-all">
            {campaign.address}
          </p>
        </div>
      </div>
    </div>
  );
});

export default CampaignOverview;