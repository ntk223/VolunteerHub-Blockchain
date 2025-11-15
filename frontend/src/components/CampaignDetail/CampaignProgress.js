import React from 'react';

const CampaignProgress = ({ campaign, progressPercentage, status }) => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Tiến độ gây quỹ</h3>
        <span className="text-2xl font-bold text-gray-800">
          {progressPercentage.toFixed(1)}%
        </span>
      </div>
      
      <div className="progress-bar mb-4">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default React.memo(CampaignProgress);