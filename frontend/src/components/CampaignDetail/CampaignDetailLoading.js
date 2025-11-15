import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';

const CampaignDetailLoading = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/30 rounded w-1/4"></div>
          <div className="card space-y-4">
            <div className="h-6 bg-white/40 rounded w-3/4"></div>
            <div className="h-4 bg-white/30 rounded w-full"></div>
            <div className="h-4 bg-white/30 rounded w-2/3"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-white/30 rounded"></div>
              <div className="h-20 bg-white/30 rounded"></div>
              <div className="h-20 bg-white/30 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CampaignDetailLoading;