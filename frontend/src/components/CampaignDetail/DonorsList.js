import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Wallet, TrendingUp, Copy, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import contractService from '../../utils/contractService.js';
import toast from 'react-hot-toast';

const DonorsList = ({ donors = [], loading = false }) => {
  const { formatAddress } = useAuth();
  const [sortBy, setSortBy] = useState('contribution'); // 'contribution' hoặc 'address'
  const [copiedAddress, setCopiedAddress] = useState(null);

  const sortedDonors = useMemo(() => {
    return [...donors].sort((a, b) => {
      if (sortBy === 'contribution') {
        return parseFloat(b.contribution) - parseFloat(a.contribution);
      } else {
        return a.address.localeCompare(b.address);
      }
    });
  }, [donors, sortBy]);

  const totalContributions = useMemo(() => {
    return donors.reduce((sum, donor) => sum + parseFloat(donor.contribution), 0);
  }, [donors]);

  const copyToClipboard = useCallback(async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      toast.success('Đã copy địa chỉ!');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      toast.error('Không thể copy địa chỉ');
    }
  }, []);

  const getContributionPercentage = useCallback((contribution) => {
    if (totalContributions === 0) return 0;
    return ((parseFloat(contribution) / totalContributions) * 100).toFixed(1);
  }, [totalContributions]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#667eea]" />
          <h4 className="font-semibold text-gray-800">Danh sách người đóng góp</h4>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/30 rounded-lg p-3 border border-white/20">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-white/40 rounded w-32"></div>
                  <div className="h-4 bg-white/40 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (donors.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Chưa có người đóng góp nào</p>
        <p className="text-sm text-gray-400">Hãy là người đầu tiên ủng hộ dự án này!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#667eea]" />
          <h4 className="font-semibold text-gray-800">
            Danh sách người đóng góp ({donors.length})
          </h4>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-[#667eea]"
        >
          <option value="contribution">Sắp xếp theo số tiền</option>
          <option value="address">Sắp xếp theo địa chỉ</option>
        </select>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 rounded-lg p-4 border border-[#667eea]/20 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-[#667eea]" />
              <span className="text-sm text-gray-600">Tổng số người</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{donors.length}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-[#764ba2]" />
              <span className="text-sm text-gray-600">Tổng đóng góp</span>
            </div>
            <p className="text-lg font-bold text-gray-800">{totalContributions.toFixed(4)} ETH</p>
          </div>
        </div>
      </div>

      {/* Donors List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedDonors.map((donor, index) => (
          <div 
            key={donor.address}
            className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/40 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                  index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' :
                  index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  #{index + 1}
                </div>
                
                {/* Address */}
                <div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-gray-500" />
                    <span className="font-mono text-sm font-medium text-gray-800">
                      {formatAddress(donor.address)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(donor.address)}
                      className="p-1 hover:bg-white/30 rounded transition-colors"
                      title="Copy địa chỉ"
                    >
                      {copiedAddress === donor.address ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    {getContributionPercentage(donor.contribution)}% tổng đóng góp
                  </p>
                </div>
              </div>

              {/* Contribution Amount */}
              <div className="text-right">
                <p className="font-bold text-gray-800">
                  {parseFloat(donor.contribution).toFixed(4)} ETH
                </p>
                <p className="text-xs text-gray-500">
                  ~${(parseFloat(donor.contribution) * 2000).toLocaleString()} USD
                </p>
              </div>
            </div>

            {/* Progress Bar for contribution */}
            <div className="mt-3">
              <div className="w-full bg-gray-200/50 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-[#667eea] to-[#764ba2] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${getContributionPercentage(donor.contribution)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button (nếu cần thiết trong tương lai) */}
      {donors.length > 10 && (
        <div className="text-center pt-4">
          <button className="text-sm text-[#667eea] hover:text-[#764ba2] font-medium">
            Xem thêm...
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(DonorsList);