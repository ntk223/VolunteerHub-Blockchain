import CampaignCard from "./CampaignCard.js";
import { Globe, Plus } from "lucide-react";
const CampaignList = ({campaigns, loading}) => {
    return (
        <>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
            <span className="ml-3 text-white">Đang tải campaigns...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="card text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Chưa có campaign nào
            </h3>
            <p className="text-gray-600 mb-4">
              Hãy là người đầu tiên tạo campaign trên platform này!
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                campaign={campaign}
              />
            ))}
        </div>
        )}
        </>
    )
}

export default CampaignList;