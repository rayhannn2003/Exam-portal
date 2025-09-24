import { useState, useEffect } from 'react';
import { 
  getTotalIncome, 
  getSchoolWiseIncome, 
  getClassWiseIncome, 
  getSchoolClassWiseIncome, 
  getAllAdminCollections 
} from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [schoolWiseIncome, setSchoolWiseIncome] = useState([]);
  const [classWiseIncome, setClassWiseIncome] = useState([]);
  const [schoolClassWiseIncome, setSchoolClassWiseIncome] = useState([]);
  const [adminCollections, setAdminCollections] = useState([]);
  const { error } = useToast();

  useEffect(() => {
    fetchAllFinanceData();
  }, []);

  const fetchAllFinanceData = async () => {
    try {
      setLoading(true);
      const [totalData, schoolData, classData, schoolClassData, adminData] = await Promise.all([
        getTotalIncome(),
        getSchoolWiseIncome(),
        getClassWiseIncome(),
        getSchoolClassWiseIncome(),
        getAllAdminCollections()
      ]);

      setTotalIncome(totalData.total_income || 0);
      setSchoolWiseIncome(schoolData || []);
      setClassWiseIncome(classData || []);
      setSchoolClassWiseIncome(schoolClassData || []);
      setAdminCollections(adminData || []);
    } catch (err) {
      error('Failed to fetch finance data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'সর্বমোট আয়', icon: '💰' },
    { id: 'school', label: 'স্কুল অনুযায়ী', icon: '🏫' },
    { id: 'class', label: 'শ্রেণী অনুযায়ী', icon: '📚' },
    { id: 'school-class', label: 'স্কুল ও শ্রেণী অনুযায়ী', icon: '🎯' },
    { id: 'admin', label: 'অ্যাডমিন অনুযায়ী', icon: '👨‍💼' }
  ];

  const renderOverview = () => (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25 border border-green-500/30">
          <span className="text-green-600 text-3xl">💰</span>
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          সর্বমোট আয়
        </h3>
        <div className="text-5xl font-bold text-green-600 mb-2">
          {formatCurrency(totalIncome)}
        </div>
        <p className="text-gray-600 text-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          সমস্ত ছাত্রের প্রবেশ ফি থেকে প্রাপ্ত মোট আয়
        </p>
      </div>
    </div>
  );

  const renderSchoolWise = () => (
    <div className="bg-white/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500">
      <h3 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        স্কুল অনুযায়ী আয়
      </h3>
      {schoolWiseIncome.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            কোন ডেটা পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  স্কুলের নাম
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আয়
                </th>
              </tr>
            </thead>
            <tbody>
              {schoolWiseIncome.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {item.school}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-blue-600">
                    {formatCurrency(item.income)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderClassWise = () => (
    <div className="bg-white/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
      <h3 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        শ্রেণী অনুযায়ী আয়
      </h3>
      {classWiseIncome.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            কোন ডেটা পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  শ্রেণী
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আয়
                </th>
              </tr>
            </thead>
            <tbody>
              {classWiseIncome.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    শ্রেণী {item.class}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-purple-600">
                    {formatCurrency(item.income)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSchoolClassWise = () => (
    <div className="bg-white/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-500">
      <h3 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        স্কুল ও শ্রেণী অনুযায়ী আয়
      </h3>
      {schoolClassWiseIncome.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            কোন ডেটা পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  স্কুলের নাম
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  শ্রেণী
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আয়
                </th>
              </tr>
            </thead>
            <tbody>
              {schoolClassWiseIncome.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {item.school}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    শ্রেণী {item.class}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-orange-600">
                    {formatCurrency(item.income)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderAdminWise = () => (
    <div className="bg-white/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-red-500/25 transition-all duration-500">
      <h3 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        অ্যাডমিন অনুযায়ী সংগ্রহ
      </h3>
      {adminCollections.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            কোন ডেটা পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  অ্যাডমিনের নাম
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  ব্যবহারকারীর নাম
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  মোট ছাত্র
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  মোট আয়
                </th>
              </tr>
            </thead>
            <tbody>
              {adminCollections.map((admin, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {admin.admin_name || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {admin.admin_username}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {admin.total_students}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-red-600">
                    {formatCurrency(admin.total_income)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'school':
        return renderSchoolWise();
      case 'class':
        return renderClassWise();
      case 'school-class':
        return renderSchoolClassWise();
      case 'admin':
        return renderAdminWise();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          আর্থিক ব্যবস্থাপনা
        </h2>
        <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          সর্বমোট আয়: {formatCurrency(totalIncome)}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-500/30 rounded-2xl p-2 shadow-2xl">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Finance;
