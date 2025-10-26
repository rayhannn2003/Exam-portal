import React, { useState, useEffect } from 'react';
import { 
  getActivityOverview, 
  getLoginStats, 
  getPDFStats, 
  getDailySummary,
  updateDailyAnalytics 
} from '../assets/services/api';

const StudentAnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loginStats, setLoginStats] = useState([]);
  const [pdfStats, setPdfStats] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    rollNumber: '',
    pdfType: ''
  });

  useEffect(() => {
    loadOverview();
    loadStats();
  }, []);

  const loadOverview = async () => {
    try {
      const data = await getActivityOverview();
      setOverview(data.data);
    } catch (err) {
      console.error('Error loading overview:', err);
      setError('Failed to load overview data');
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [loginData, pdfData, summaryData] = await Promise.all([
        getLoginStats({ limit: 50 }),
        getPDFStats({ limit: 50 }),
        getDailySummary({ limit: 30 })
      ]);
      
      setLoginStats(loginData.data || []);
      setPdfStats(pdfData.data || []);
      setDailySummary(summaryData.data || []);
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      const filterObj = {};
      if (filters.startDate) filterObj.startDate = filters.startDate;
      if (filters.endDate) filterObj.endDate = filters.endDate;
      if (filters.rollNumber) filterObj.rollNumber = filters.rollNumber;
      
      const [loginData, pdfData] = await Promise.all([
        getLoginStats(filterObj),
        getPDFStats({ ...filterObj, pdfType: filters.pdfType || undefined })
      ]);
      
      setLoginStats(loginData.data || []);
      setPdfStats(pdfData.data || []);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnalytics = async () => {
    try {
      await updateDailyAnalytics();
      alert('✅ Daily analytics updated successfully!');
      loadStats();
    } catch (err) {
      console.error('Error updating analytics:', err);
      alert('❌ Failed to update analytics');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPdfTypeEmoji = (type) => {
    const emojis = {
      'admit_card': '🎫',
      'question_paper': '📝',
      'scholarship': '🏆',
      'result': '📊'
    };
    return emojis[type] || '📄';
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">📊 Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📊 Student Activity Dashboard
              </h1>
              <p className="text-gray-600">
                Monitor student logins and PDF download activities
              </p>
            </div>
            <button
              onClick={handleUpdateAnalytics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🔄 Update Analytics
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Today's Logins</p>
                  <p className="text-3xl font-bold text-blue-600">{overview.todayStats.logins}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Today's Downloads</p>
                  <p className="text-3xl font-bold text-green-600">{overview.todayStats.downloads}</p>
                </div>
                <div className="text-4xl">📥</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Week's Logins</p>
                  <p className="text-3xl font-bold text-purple-600">{overview.weekStats.logins}</p>
                </div>
                <div className="text-4xl">📅</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Week's Downloads</p>
                  <p className="text-3xl font-bold text-orange-600">{overview.weekStats.downloads}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>
        )}

        {/* Download Types */}
        {overview && Object.keys(overview.downloadTypes).length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Popular Download Types (Last 30 Days)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(overview.downloadTypes).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">{getPdfTypeEmoji(type)}</div>
                  <p className="text-lg font-bold text-gray-800">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'logins', label: '👥 Login Activity', icon: '👥' },
                { id: 'downloads', label: '📥 PDF Downloads', icon: '📥' },
                { id: 'summary', label: '📈 Daily Summary', icon: '📈' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Filters */}
            {(activeTab === 'logins' || activeTab === 'downloads') && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">🔍 Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Roll Number"
                    value={filters.rollNumber}
                    onChange={(e) => setFilters({...filters, rollNumber: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {activeTab === 'downloads' && (
                    <select
                      value={filters.pdfType}
                      onChange={(e) => setFilters({...filters, pdfType: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All PDF Types</option>
                      <option value="admit_card">🎫 Admit Card</option>
                      <option value="question_paper">📝 Question Paper</option>
                      <option value="scholarship">🏆 Scholarship</option>
                      <option value="result">📊 Result</option>
                    </select>
                  )}
                  <button
                    onClick={applyFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'overview' && overview && (
              <div>
                {overview.recentActivity && overview.recentActivity.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">🕒 Recent Login Activity</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {overview.recentActivity.map((activity, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {activity.student_name || 'Unknown'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {activity.roll_number || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(activity.login_time)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {activity.ip_address || 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-500">No recent activity data available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logins' && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">👥 Login Activity</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading login data...</p>
                  </div>
                ) : loginStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loginStats.map((login, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {login.student_name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                              {login.roll_number || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(login.login_time)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {login.ip_address || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {login.user_agent ? (
                                login.user_agent.includes('Mobile') ? '📱 Mobile' : '💻 Desktop'
                              ) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-gray-500">No login data available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'downloads' && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">📥 PDF Download Activity</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading download data...</p>
                  </div>
                ) : pdfStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pdfStats.map((download, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {download.student_name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                              {download.roll_number || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getPdfTypeEmoji(download.pdf_type)} {download.pdf_type?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                              {download.file_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(download.download_time)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                download.success 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {download.success ? '✅ Success' : '❌ Failed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📥</div>
                    <p className="text-gray-500">No download data available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">📈 Daily Summary</h3>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading summary data...</p>
                  </div>
                ) : dailySummary.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Logins</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Students</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF Downloads</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admit Cards</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question Papers</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dailySummary.map((day, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(day.date).toLocaleDateString('bn-BD')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                              {day.total_logins || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                              {day.unique_students || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-bold">
                              {day.total_pdf_downloads || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                              {day.admit_card_downloads || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {day.question_paper_downloads || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-gray-500">No summary data available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsDashboard;
