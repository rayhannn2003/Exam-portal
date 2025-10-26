import { useState, useEffect } from 'react';
import { getTodayActivity, getWeekActivity, getActiveUsers, getActivitySummary, getAllActivity, getActivityStats } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const Activity = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [todayActivity, setTodayActivity] = useState([]);
  const [weekActivity, setWeekActivity] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [allActivity, setAllActivity] = useState({ data: [], pagination: {} });
  const [currentPage, setCurrentPage] = useState(1);
  const { success, error } = useToast();

  useEffect(() => {
    fetchActivityStats();
    if (activeTab === 'today') fetchTodayActivity();
    else if (activeTab === 'week') fetchWeekActivity();
    else if (activeTab === 'active') fetchActiveUsers();
    else if (activeTab === 'all') fetchAllActivity(currentPage);
  }, [activeTab, currentPage]);

  const fetchActivityStats = async () => {
    try {
      setLoading(true);
      const data = await getActivityStats();
      setStats(data);
    } catch (err) {
      error('পরিসংখ্যান লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayActivity = async () => {
    try {
      setLoading(true);
      const data = await getTodayActivity();
      setTodayActivity(data);
    } catch (err) {
      error('আজকের কার্যকলাপ লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekActivity = async () => {
    try {
      setLoading(true);
      const data = await getWeekActivity();
      setWeekActivity(data);
    } catch (err) {
      error('সাপ্তাহিক কার্যকলাপ লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const data = await getActiveUsers();
      setActiveUsers(data);
    } catch (err) {
      error('সক্রিয় ব্যবহারকারী লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllActivity = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getAllActivity(page, 20);
      setAllActivity(data);
    } catch (err) {
      error('সমস্ত কার্যকলাপ লোড করতে ব্যর্থ');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-green-100 text-green-700';
      case 'superadmin': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'student': return 'ছাত্র';
      case 'admin': return 'অ্যাডমিন';
      case 'superadmin': return 'সুপার অ্যাডমিন';
      default: return role;
    }
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              মোট লগইন
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.total_logins || 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">📊</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              অনন্য ব্যবহারকারী
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.unique_users || 0}</p>
          </div>
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">👥</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              আজকের লগইন
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.today_logins || 0}</p>
          </div>
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">📅</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              সক্রিয় ব্যবহারকারী
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.currently_active || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🟢</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-blue-400/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              ছাত্র লগইন
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.student_logins || 0}</p>
          </div>
          <div className="w-12 h-12 bg-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🎓</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-green-400/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              অ্যাডমিন লগইন
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.admin_logins || 0}</p>
          </div>
          <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">👨‍💼</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              সুপার অ্যাডমিন লগইন
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.superadmin_logins || 0}</p>
          </div>
          <div className="w-12 h-12 bg-purple-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">👑</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              সাপ্তাহিক লগইন
            </p>
            <p className="text-3xl font-bold text-gray-800">{stats.week_logins || 0}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">📈</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTable = (activities, title) => (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-500/20 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        {title}
      </h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            কোনো কার্যকলাপ পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  নাম
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  ভূমিকা
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  পরিচয়
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  আইপি ঠিকানা
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  প্ল্যাটফর্ম
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  লগইন সময়
                </th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  অবস্থা
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity.id || index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-2 text-gray-800 font-medium">
                    {activity.name}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(activity.role)}`}>
                      {getRoleText(activity.role)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {activity.identifier}
                  </td>
                  <td className="py-3 px-2 text-gray-600 text-sm">
                    {activity.ip_address || 'N/A'}
                  </td>
                  <td className="py-3 px-2 text-gray-600 text-sm">
                    <div className="flex items-center space-x-1">
                      {activity.is_mobile && <span className="text-blue-500">📱</span>}
                      <span>{activity.platform || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-500 text-sm">
                    {formatDate(activity.login_time)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderPagination = () => {
    const { pagination } = allActivity;
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          পৃষ্ঠা {pagination.page} / {pagination.totalPages} (মোট {pagination.total} টি রেকর্ড)
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            পূর্ববর্তী
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage >= pagination.totalPages}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            পরবর্তী
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'today':
        return renderActivityTable(todayActivity, 'আজকের কার্যকলাপ');
      case 'week':
        return renderActivityTable(weekActivity, 'সাপ্তাহিক কার্যকলাপ');
      case 'active':
        return renderActivityTable(activeUsers, 'সক্রিয় ব্যবহারকারী');
      case 'all':
        return (
          <div>
            {renderActivityTable(allActivity.data, 'সমস্ত কার্যকলাপ')}
            {renderPagination()}
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-2xl p-2 shadow-lg">
        <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', name: 'সংক্ষিপ্ত বিবরণ', icon: '📊' },
            { id: 'today', name: 'আজকের কার্যকলাপ', icon: '📅' },
            { id: 'week', name: 'সাপ্তাহিক কার্যকলাপ', icon: '📈' },
            { id: 'active', name: 'সক্রিয় ব্যবহারকারী', icon: '🟢' },
            { id: 'all', name: 'সমস্ত কার্যকলাপ', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'all') setCurrentPage(1);
              }}
              className={`py-2 px-4 text-sm font-bold transition-all duration-300 rounded-xl whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
              }`}
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Activity;
