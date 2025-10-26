import { useState, useEffect } from 'react';
import { getTodayActivity, getWeekActivity, getActiveUsers, getActivitySummary, getAllActivity, getActivityStats } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const Activity = () => {
  const [activeView, setActiveView] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [todayActivity, setTodayActivity] = useState([]);
  const [weekActivity, setWeekActivity] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [summary, setSummary] = useState([]);
  const [allActivity, setAllActivity] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const { success, error } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchTodayActivity(),
        fetchActiveUsers()
      ]);
    } catch (err) {
      error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getActivityStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchTodayActivity = async () => {
    try {
      const data = await getTodayActivity();
      setTodayActivity(data);
    } catch (err) {
      console.error('Error fetching today activity:', err);
    }
  };

  const fetchWeekActivity = async () => {
    try {
      const data = await getWeekActivity();
      setWeekActivity(data);
    } catch (err) {
      console.error('Error fetching week activity:', err);
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const data = await getActiveUsers();
      setActiveUsers(data);
    } catch (err) {
      console.error('Error fetching active users:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await getActivitySummary();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  const fetchAllActivity = async (page = 1) => {
    try {
      const data = await getAllActivity(page, pagination.limit);
      setAllActivity(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching all activity:', err);
    }
  };

  const handleViewChange = async (view) => {
    setActiveView(view);
    setLoading(true);
    
    try {
      switch (view) {
        case 'today':
          await fetchTodayActivity();
          break;
        case 'week':
          await fetchWeekActivity();
          break;
        case 'active':
          await fetchActiveUsers();
          break;
        case 'summary':
          await fetchSummary();
          break;
        case 'all':
          await fetchAllActivity();
          break;
        default:
          break;
      }
    } catch (err) {
      error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'student': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'superadmin': return 'সুপার অ্যাডমিন';
      case 'admin': return 'অ্যাডমিন';
      case 'student': return 'ছাত্র';
      default: return role;
    }
  };

  const renderStats = () => (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট লগইন
              </p>
              <p className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {stats?.total_logins || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ইউনিক ব্যবহারকারী
              </p>
              <p className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {stats?.unique_users || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                আজকের লগইন
              </p>
              <p className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {stats?.today_logins || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                সক্রিয় ব্যবহারকারী
              </p>
              <p className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {stats?.currently_active || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🟢</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-wise Stats */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-500/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          ভূমিকা অনুযায়ী লগইন
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-green-200 rounded-xl">
            <p className="text-green-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>ছাত্র</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.student_logins || 0}</p>
          </div>
          <div className="text-center p-4 border border-blue-200 rounded-xl">
            <p className="text-blue-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>অ্যাডমিন</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.admin_logins || 0}</p>
          </div>
          <div className="text-center p-4 border border-purple-200 rounded-xl">
            <p className="text-purple-600 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>সুপার অ্যাডমিন</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.superadmin_logins || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityList = (activities, title) => (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-500/30 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
        {title}
      </h3>
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          কোনো কার্যকলাপ পাওয়া যায়নি
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(activity.role)}`}>
                  {getRoleText(activity.role)}
                </span>
                <div>
                  <p className="font-medium text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {activity.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.identifier} • {activity.ip_address}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {formatDateTime(activity.login_time)}
                </p>
                {activity.active && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    সক্রিয়
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      );
    }

    switch (activeView) {
      case 'stats':
        return renderStats();
      case 'today':
        return renderActivityList(todayActivity, 'আজকের কার্যকলাপ');
      case 'week':
        return renderActivityList(weekActivity, 'সাপ্তাহিক কার্যকলাপ');
      case 'active':
        return renderActivityList(activeUsers, 'সক্রিয় ব্যবহারকারী');
      case 'all':
        return (
          <div className="space-y-4">
            {renderActivityList(allActivity, 'সমস্ত কার্যকলাপ')}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => fetchAllActivity(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  পূর্ববর্তী
                </button>
                <span className="px-3 py-1">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchAllActivity(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                >
                  পরবর্তী
                </button>
              </div>
            )}
          </div>
        );
      default:
        return renderStats();
    }
  };

  const viewButtons = [
    { id: 'stats', name: 'পরিসংখ্যান', icon: '📊' },
    { id: 'today', name: 'আজ', icon: '📅' },
    { id: 'week', name: 'সাপ্তাহ', icon: '📆' },
    { id: 'active', name: 'সক্রিয়', icon: '🟢' },
    { id: 'all', name: 'সব', icon: '📋' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          ব্যবহারকারী কার্যকলাপ ট্র্যাকিং
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          রিফ্রেশ
        </button>
      </div>

      {/* View Buttons */}
      <div className="flex space-x-2 overflow-x-auto">
        {viewButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleViewChange(button.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeView === button.id
                ? 'bg-green-600 text-white'
                : 'bg-white/80 text-gray-700 border border-gray-300 hover:bg-green-50'
            }`}
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            <span className="mr-2">{button.icon}</span>
            {button.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Activity;
