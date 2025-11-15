import { Plus, RefreshCw, Globe, AlertCircle } from 'lucide-react';
const ActionButton = ({loading, setShowCreateForm, fetchCampaigns}) => {
    return (
        <>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {!loading ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Tạo Campaign Mới
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800">Kết nối ví để bắt đầu</div>
                <div className="text-yellow-700 text-sm">
                  Bạn cần kết nối MetaMask để tạo campaign hoặc quyên góp
                </div>
              </div>
            </div>
          )}

          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent"></div>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Làm mới
          </button>
        </div>

        </>
    )
}

export default ActionButton;