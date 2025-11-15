import React, { useState } from 'react';
import { Plus, X, Target, Calendar } from 'lucide-react';
import { useCampaign } from '../../hooks/useCampaign.js';
import { useAuth } from '../../hooks/useAuth.js';
import toast from 'react-hot-toast';

const CreateCampaign = ({ onClose }) => {
  const { account } = useAuth();
  const { createCampaign } = useCampaign();
  
  const [formData, setFormData] = useState({
    targetAmount: '',
    duration: '',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.targetAmount || !formData.duration || !formData.description) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!account) {
      toast.error('Vui lòng kết nối ví trước!');
      return;
    }

    setLoading(true);
    console.log(account, formData);
    const success = await createCampaign(account, formData.targetAmount, parseInt(formData.duration), formData.description);
    
    if (success) {
      onClose();
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tạo Campaign Mới</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-2" />
              Mục tiêu (ETH)
            </label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              placeholder="10"
              step="0.01"
              min="0"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Thời hạn (ngày)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="30"
              min="1"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề (tùy chọn)
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Tên của campaign"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả về Campaign
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả về campaign của bạn..."
              rows="3"
              className="input resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Tạo Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;