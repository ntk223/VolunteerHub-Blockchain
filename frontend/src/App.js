import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CampaignProvider } from './hooks/useCampaign.js';
import { AuthProvider } from './hooks/useAuth.js';
import CampaignPage from './page/CampaignPage.js';
import CampaignDetailPage from './page/CampaignDetailPage.js';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CampaignProvider>
          <Routes>
            <Route path="/" element={<CampaignPage />} />
            <Route path="/campaign/:address" element={<CampaignDetailPage />} />
          </Routes>
        </CampaignProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;