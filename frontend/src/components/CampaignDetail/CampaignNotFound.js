import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Header from '../Header/Header.js';
import Footer from '../Footer/Footer.js';

const CampaignNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container py-8 text-center">
        <div className="card">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Campaign không tồn tại</h2>
          <p className="text-gray-600 mb-6">
            Campaign này có thể đã bị xóa hoặc địa chỉ không đúng.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CampaignNotFound;