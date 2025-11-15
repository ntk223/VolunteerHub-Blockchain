import { Plus, Vote } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const CampaignProposals = ({ campaign, status, onCreateProposal }) => {
  const { account } = useAuth();

  return (
    <div className="space-y-4">
      {account === campaign.owner && status.status === 'success' && (
        <div className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 border border-[#667eea]/30 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-gray-700 mb-3">
            Campaign đã thành công! Bạn có thể tạo đề xuất để sử dụng số tiền đã gây được.
          </p>
          <button
            onClick={onCreateProposal}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Tạo đề xuất mới
          </button>
        </div>
      )}
      
      <div className="text-center py-8 text-gray-500">
        <Vote className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Chưa có đề xuất nào được tạo</p>
        <p className="text-sm">Đề xuất sẽ xuất hiện khi campaign thành công</p>
      </div>
    </div>
  );
};

export default CampaignProposals;