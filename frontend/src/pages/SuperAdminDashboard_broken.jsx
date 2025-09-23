import { useState, useEffect } from 'react';
import { getAllExams, getAllStudents } from '../assets/services/api';

// Logout function
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  window.location.href = '/';
  if (window.showToast) {
    window.showToast('সফলভাবে লগআউট হয়েছেন!', 'success');
  }
};

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch exams data
      const examsData = await getAllExams();
      setExams(examsData);
      
      // Fetch students data
      const studentsData = await getAllStudents();
      setStudents(studentsData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'exams', name: 'Exams', icon: '📝' },
    { id: 'results', name: 'Results', icon: '📈' },
    { id: 'students', name: 'Students', icon: '👥' },
    { id: 'admins', name: 'Admins', icon: '👨‍💼' },
    { id: 'finance', name: 'Finance', icon: '💰' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-200 to-green-300 border border-green-400 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট পরীক্ষা
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {exams.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-900 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 border border-green-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবন্ধিত ছাত্র
              </p>
              <p className="text-3xl font-bold text-green-800 mt-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {students.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-300 to-green-400 border border-green-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-900 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                প্রশ্ন সেট
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {exams.reduce((total, exam) => total + parseInt(exam.set_count || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-800 to-green-900 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট আয়
              </p>
              <p className="text-3xl font-bold text-green-700 mt-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ৳0
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class-wise Student Registration Modern Chart */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 backdrop-blur-xl border border-green-300 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold text-green-900 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              শ্রেণীভিত্তিক নিবন্ধিত ছাত্র
            </h3>
            <p className="text-green-700 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              মোট {students.length} জন ছাত্র নিবন্ধিত
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-700 rounded-full"></div>
            <span className="text-green-800 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              নিবন্ধিত ছাত্র
            </span>
          </div>
        </div>
        
        {(() => {
          // Group students by class - calculate outside to use in summary
          const classGroups = students.reduce((acc, student) => {
            const className = student.class || 'অজানা';
            acc[className] = (acc[className] || 0) + 1;
            return acc;
          }, {});
          
          return (
            <>
              <div className="space-y-6">
                {(() => {
                  // Get max count for scaling
                  const maxCount = Math.max(...Object.values(classGroups), 1);
                  
                  return Object.entries(classGroups)
              .sort(([a], [b]) => a.localeCompare(b, 'bn-BD'))
              .map(([className, count], index) => {
                const percentage = (count / maxCount) * 100;
                const delay = index * 150; // Staggered animation delay
                
                return (
                  <div key={className} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <span className="text-green-100 text-sm font-bold">
                            {className.charAt(0)}
                          </span>
                        </div>
                        <span className="text-green-900 font-bold text-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {className}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            {count}
                          </div>
                          <div className="text-green-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            জন ছাত্র
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-green-100 text-lg">👥</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Modern Progress Bar */}
                    <div className="relative">
                      <div className="w-full bg-green-200 rounded-2xl h-8 shadow-inner border border-green-300 overflow-hidden">
                        <div 
                          className="h-8 rounded-2xl transition-all duration-1000 ease-out relative overflow-hidden group-hover:shadow-lg"
                          style={{ 
                            width: `${percentage}%`,
                            animationDelay: `${delay}ms`,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                          }}
                        >
                          {/* Animated shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                          
                          {/* Count display inside bar */}
                          <div className="absolute inset-0 flex items-center justify-end pr-3">
                            <span className="text-green-100 text-sm font-bold drop-shadow-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                              {count}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Percentage indicator */}
                      <div className="absolute -top-8 right-0 bg-green-800 text-green-100 px-3 py-1 rounded-full text-xs font-bold shadow-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  </div>
                );
                  });
                })()}
              </div>
              
              {students.length === 0 && (
                <div className="text-center py-16">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <span className="text-green-100 text-4xl">👥</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-green-100 text-sm">0</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-green-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    এখনও কোন ছাত্র নিবন্ধিত হয়নি
                  </h4>
                  <p className="text-green-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ছাত্র নিবন্ধন শুরু হলে এখানে চার্ট দেখতে পাবেন
                  </p>
                </div>
              )}
              
              {/* Chart Summary */}
              {students.length > 0 && (
                <div className="mt-8 pt-6 border-t border-green-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {Object.keys(classGroups).length}
                      </div>
                      <div className="text-green-700 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        মোট শ্রেণী
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {students.length}
                      </div>
                      <div className="text-green-700 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        মোট ছাত্র
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {Math.round(students.length / Object.keys(classGroups).length) || 0}
                      </div>
                      <div className="text-green-700 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        গড় ছাত্র/শ্রেণী
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
    </div>
  );

  const renderExams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-green-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          পরীক্ষা ব্যবস্থাপনা
        </h2>
        <button className="bg-gradient-to-r from-green-600 to-green-800 text-green-100 font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-900 transition-all transform hover:scale-105 shadow-lg border border-green-500">
          <span className="mr-2">➕</span>
          নতুন পরীক্ষা
        </button>
      </div>
      
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green-400">
                <th className="text-left py-4 px-2 text-green-900 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  পরীক্ষার নাম
                </th>
                <th className="text-left py-4 px-2 text-green-900 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  শ্রেণী
                </th>
                <th className="text-left py-4 px-2 text-green-900 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  বছর
                </th>
                <th className="text-left py-4 px-2 text-green-900 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  সেট সংখ্যা
                </th>
                <th className="text-left py-4 px-2 text-green-900 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  তৈরি হয়েছে
                </th>
                <th className="text-left py-4 px-2 text-green-900 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  কাজ
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b border-green-300 hover:bg-green-200 transition-colors">
                  <td className="py-4 px-2 text-green-900" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.title}
                  </td>
                  <td className="py-4 px-2 text-green-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.class}
                  </td>
                  <td className="py-4 px-2 text-green-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.year}
                  </td>
                  <td className="py-4 px-2">
                    <span className="bg-green-300 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-500">
                      {exam.set_count}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-green-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {new Date(exam.created_at).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex space-x-2">
                      <button className="text-green-800 hover:text-green-900 text-sm font-medium bg-green-300 px-3 py-1 rounded-lg hover:bg-green-400 transition-colors border border-green-500">
                        সম্পাদনা
                      </button>
                      <button className="text-green-800 hover:text-green-900 text-sm font-medium bg-green-200 px-3 py-1 rounded-lg hover:bg-green-300 transition-colors border border-green-400">
                        মুছুন
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );


  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'exams':
        return renderExams();
      case 'results':
        return (
          <div className="bg-gradient-to-br from-green-100 to-green-200 backdrop-blur-xl border border-green-400 rounded-2xl p-12 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-700 to-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-100 text-2xl">📈</span>
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ফলাফল বিভাগ
              </h3>
              <p className="text-green-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শীঘ্রই আসছে...
              </p>
            </div>
          </div>
        );
      case 'students':
        return (
          <div className="bg-gradient-to-br from-green-200 to-green-300 backdrop-blur-xl border border-green-500 rounded-2xl p-12 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-100 text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ছাত্র বিভাগ
              </h3>
              <p className="text-green-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শীঘ্রই আসছে...
              </p>
            </div>
          </div>
        );
      case 'admins':
        return (
          <div className="bg-gradient-to-br from-green-50 to-green-100 backdrop-blur-xl border border-green-300 rounded-2xl p-12 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-100 text-2xl">👨‍💼</span>
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                অ্যাডমিন বিভাগ
              </h3>
              <p className="text-green-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শীঘ্রই আসছে...
              </p>
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="bg-gradient-to-br from-green-300 to-green-400 backdrop-blur-xl border border-green-600 rounded-2xl p-12 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-800 to-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-green-100 text-2xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                আর্থিক বিভাগ
              </h3>
              <p className="text-green-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শীঘ্রই আসছে...
              </p>
            </div>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header - Sticky */}
      <div className="bg-green-900/95 backdrop-blur-xl border-b border-green-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-700 to-green-900 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-green-100 text-xl font-bold">SA</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-50 drop-shadow-lg" 
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                সুপার অ্যাডমিন ড্যাশবোর্ড
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-green-800/50 px-4 py-2 rounded-full border border-green-700">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-green-100 text-sm font-bold">👤</span>
                </div>
                <span className="text-green-100 font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  স্বাগতম, সুপার অ্যাডমিন
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-green-600 to-green-700 text-green-50 font-bold py-2 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg border border-green-500"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Sticky */}
      <div className="bg-green-800/90 backdrop-blur-md border-b border-green-700 sticky top-20 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 text-sm font-bold transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-400 text-green-200 bg-green-700/50'
                    : 'border-transparent text-green-300 hover:text-green-100 hover:border-green-400 hover:bg-green-700/30'
                }`}
                style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
