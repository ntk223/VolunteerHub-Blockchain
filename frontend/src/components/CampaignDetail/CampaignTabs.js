import React, { useMemo } from 'react';
import { FileText, Vote, Users, Activity } from 'lucide-react';

const CampaignTabs = ({ activeTab, setActiveTab, children }) => {
  const tabs = useMemo(() => [
    { id: 'overview', label: 'Tổng quan', icon: FileText },
    { id: 'proposals', label: 'Đề xuất', icon: Vote },
    { id: 'donors', label: 'Người đóng góp', icon: Users },
    { id: 'events', label: 'Hoạt động', icon: Activity },
  ], []);

  return (
    <div className="card">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-[#667eea] text-[#667eea]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default React.memo(CampaignTabs);