import { useState, useEffect } from 'react';
import { getAllExams, getAllStudents, getRegistrationCountOverTime, getExamWithClasses, deleteExam, getAdminNameByUsername } from '../assets/services/api';
import CreateExamModal from '../components/CreateExamModal';
import EditExamModal from '../components/EditExamModal';
import SetManagementModal from '../components/SetManagementModal';
import ExamManagement from '../components/ExamManagement';
import Results from './Results';
import Scholarship from './Scholarship';
import Students from './Students';
import Admins from './Admins';
import Finance from './Finance';
import { ToastProvider } from '../contexts/ToastContext';
import { sendClassReminder } from '../assets/services/api';

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
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [showSetManagementModal, setShowSetManagementModal] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  // Reminders tab state
  const defaultReminderMessage = 'Dear Student, your UTCKS Scholarship Exam is tomorrow at 10 AM. Roll: {ROLL}. Please be present by 9:30 AM and bring your admit card. Best of luck!';
  const [reminderSelectedClass, setReminderSelectedClass] = useState('');
  const [reminderMessage, setReminderMessage] = useState(defaultReminderMessage);
  const [reminderSending, setReminderSending] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderStats, setReminderStats] = useState(null);
  const [superAdminName, setSuperAdminName] = useState(localStorage.getItem('name') || '');

  useEffect(() => {
    fetchDashboardData();
    fetchSuperAdminName();
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
      
      // Fetch registration count over time
      const registrationCountData = await getRegistrationCountOverTime();
      console.log('Registration data:', registrationCountData); // Debug log
      setRegistrationData(registrationCountData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = () => {
    setShowCreateExamModal(true);
  };

  const handleEditExam = (exam) => {
    setSelectedExam(exam);
    setShowEditExamModal(true);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteExam(examId);
        await fetchDashboardData();
        if (window.showToast) {
          window.showToast('Exam deleted successfully!', 'success');
        }
      } catch (error) {
        console.error('Error deleting exam:', error);
        if (window.showToast) {
          window.showToast('Failed to delete exam', 'error');
        }
      }
    }
  };

  const handleManageSets = async (exam) => {
    try {
      const examWithClasses = await getExamWithClasses(exam.id);
      setSelectedExam(examWithClasses);
      setShowSetManagementModal(true);
    } catch (error) {
      console.error('Error fetching exam details:', error);
    }
  };

  const handleEditSet = (set) => {
    setEditingSet(set);
    setShowSetManagementModal(true);
  };

  const fetchSuperAdminName = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) return;
      const res = await getAdminNameByUsername(username);
      if (res?.name) {
        setSuperAdminName(res.name);
        localStorage.setItem('name', res.name);
      }
    } catch (e) {
      console.error('Failed to fetch super admin name');
    }
  };

  const handleModalSuccess = () => {
    fetchDashboardData();
    if (window.showToast) {
      window.showToast('Operation completed successfully!', 'success');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'exams', name: 'Exams', icon: '📝' },
    { id: 'results', name: 'Results', icon: '📈' },
    { id: 'scholarship',name: 'Scholarship', icon: '🎓' },
    { id: 'students', name: 'Students', icon: '👥' },
    { id: 'admins', name: 'Admins', icon: '👨‍💼' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'reminders', name: 'Reminders', icon: '📨' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:border-green-400/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট পরীক্ষা
              </p>
              <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {exams.length}
              </p>
              <div className="flex items-center text-green-600 text-xs">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +12% from last month
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
              <span className="text-3xl">📝</span>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-red-500/25 transition-all duration-500 transform hover:scale-105 hover:border-red-400/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবন্ধিত ছাত্র
              </p>
              <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {students.length}
              </p>
              <div className="flex items-center text-red-600 text-xs">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +8% from last week
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 transform hover:scale-105 hover:border-yellow-400/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                প্রশ্ন ক্লাস
              </p>
              <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {exams.reduce((total, exam) => total + parseInt(exam.class_count || 0), 0)}
              </p>
              <div className="flex items-center text-yellow-600 text-xs">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +15% from last month
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/25 group-hover:shadow-yellow-500/40 transition-all duration-300">
              <span className="text-3xl">📚</span>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:border-green-400/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট আয়
              </p>
              <p className="text-3xl font-bold text-gray-800 mb-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ৳0
              </p>
              <div className="flex items-center text-green-600 text-xs">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                +0% from last month
              </div>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Class-wise Student Registration Professional Bar Chart */}
        <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শ্রেণীভিত্তিক নিবন্ধিত ছাত্র
              </h3>
              <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                মোট {students.length} জন ছাত্র নিবন্ধিত
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবন্ধিত ছাত্র
              </span>
            </div>
          </div>
          
          {students.length > 0 ? (
            <div className="space-y-6">
              {(() => {
                // Group students by class
                const classGroups = students.reduce((acc, student) => {
                  const className = student.class || 'অজানা';
                  acc[className] = (acc[className] || 0) + 1;
                  return acc;
                }, {});
                
                // Get max count for scaling
                const maxCount = Math.max(...Object.values(classGroups), 1);
                
                // Define distinct colors for each bar
                const barColors = [
                  'bg-gradient-to-t from-green-500 to-green-600', // Green
                  'bg-gradient-to-t from-red-500 to-red-600', // Red
                  'bg-gradient-to-t from-yellow-500 to-yellow-600', // Yellow
                  'bg-gradient-to-t from-emerald-500 to-emerald-600', // Emerald
                  'bg-gradient-to-t from-rose-500 to-rose-600', // Rose
                  'bg-gradient-to-t from-amber-500 to-amber-600', // Amber
                  'bg-gradient-to-t from-lime-500 to-lime-600', // Lime
                  'bg-gradient-to-t from-orange-500 to-orange-600', // Orange
                ];
                
                return (
                  <div className="space-y-6">
                    {/* Chart Area */}
                    <div className="relative">
                      {/* Y-axis */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between">
                        <div className="text-right text-xs text-gray-600 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {maxCount}
                        </div>
                        <div className="text-right text-xs text-gray-600 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {Math.round(maxCount * 0.75)}
                        </div>
                        <div className="text-right text-xs text-gray-600 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {Math.round(maxCount * 0.5)}
                        </div>
                        <div className="text-right text-xs text-gray-600 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {Math.round(maxCount * 0.25)}
                        </div>
                        <div className="text-right text-xs text-gray-600 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          0
                        </div>
                      </div>
                      
                      {/* Chart Content */}
                      <div className="ml-10">
                        {/* Y-axis label */}
                        <div className="absolute -left-18 top-1/2 transform -rotate-90 text-sm font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          Number of students
                        </div>
                        
                        {/* Bars Container */}
                        <div className="flex items-end justify-between space-x-3 h-64">
                          {Object.entries(classGroups)
                            .sort(([a], [b]) => {
                              // Convert to numbers for proper numerical sorting
                              const numA = parseInt(a);
                              const numB = parseInt(b);
                              if (!isNaN(numA) && !isNaN(numB)) {
                                return numA - numB;
                              }
                              // Fallback to string comparison for non-numeric values
                              return a.localeCompare(b, 'bn-BD');
                            })
                            .map(([className, count], index) => {
                              const height = (count / maxCount) * 200; // Max height 200px
                              const colorClass = barColors[index % barColors.length];
                              
                              return (
                                <div key={className} className="group flex-1 flex flex-col items-center">
                                  {/* Tooltip */}
                                  <div className="absolute -top-12 bg-white/95 backdrop-blur-xl text-gray-800 px-3 py-2 rounded-lg text-xs font-bold shadow-2xl shadow-green-500/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-green-500/30" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                    <div className="text-center">
                                      <div className="font-bold text-green-600">{count} জন</div>
                                      <div className="text-gray-600">{className}</div>
                                    </div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/95"></div>
                                  </div>
                                  
                                  {/* Bar */}
                                  <div className="relative w-full flex flex-col items-center">
                                    <div 
                                      className={`w-full ${colorClass} rounded-t-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 relative overflow-hidden`}
                                      style={{ 
                                        height: `${height}px`,
                                        minHeight: '4px'
                                      }}
                                    >
                                      {/* Subtle texture overlay */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                                      
                                      {/* Value display on top of bar */}
                                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                        {count}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* X-axis label */}
                                  <div className="mt-3 text-xs text-gray-700 font-medium text-center" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                                    {className}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        
                        {/* X-axis line */}
                        <div className="w-full h-0.5 bg-gray-400 mt-4"></div>
                        
                        {/* X-axis label */}
                        <div className="text-center mt-2 text-sm font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          Class categories
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/25 border border-green-500/30">
                <span className="text-green-600 text-2xl">👥</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                এখনও কোন ছাত্র নিবন্ধিত হয়নি
              </h4>
              <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ছাত্র নিবন্ধন শুরু হলে এখানে চার্ট দেখতে পাবেন
              </p>
            </div>
          )}
        </div>

        {/* Student Registration Over Time Line Chart */}
        <div className="bg-white/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 shadow-2xl hover:shadow-red-500/25 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবন্ধন সময়সূচী
              </h3>
              <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                দিনভিত্তিক ছাত্র নিবন্ধন সংখ্যা
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবন্ধন সংখ্যা
              </span>
            </div>
          </div>
          
          {registrationData && registrationData.length > 0 ? (
            <div className="space-y-4">
              {/* Chart Container with Grid */}
              <div className="relative h-80 bg-white/60 backdrop-blur-xl rounded-lg border border-red-500/30 overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0">
                  {/* Horizontal Grid Lines */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div
                      key={`h-${i}`}
                      className="absolute w-full h-px bg-gray-300/50"
                      style={{ top: `${i * 10}%` }}
                    />
                  ))}
                  {/* Vertical Grid Lines */}
                  {registrationData.length > 1 && registrationData.map((_, i) => (
                    <div
                      key={`v-${i}`}
                      className="absolute h-full w-px bg-gray-300/50"
                      style={{ left: `${(i / (registrationData.length - 1)) * 100}%` }}
                    />
                  ))}
                </div>
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between">
                  {(() => {
                    const maxCount = Math.max(...registrationData.map(d => Number(d.registration_count)), 1);
                    const chartMax = Math.ceil(maxCount * 1.5); // 1.5x the max value for better proportions
                    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <div
                        key={i}
                        className="text-right text-xs text-gray-600 font-medium"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        {Math.round((chartMax * (9 - i)) / 9)}
                      </div>
                    ));
                  })()}
                </div>

                {/* Y-axis Label */}
                <div className="absolute -left-12 top-1/2 transform -rotate-90 text-sm font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  Value
                </div>

                {/* Chart Content */}
                <div className="ml-10 h-full relative">
                  {/* Smooth Curved Line Chart */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {(() => {
                      const maxCount = Math.max(...registrationData.map(d => Number(d.registration_count)), 1);
                      const chartMax = Math.ceil(maxCount * 1.5); // 1.5x the max value for better proportions
                      
                      // Create smooth curve using cubic bezier
                      const createSmoothPath = (data) => {
                        if (data.length < 2) return '';
                        
                        const points = data.map((item, index) => {
                          const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
                          const y = 100 - (Number(item.registration_count) / chartMax) * 100;
                          return { x, y };
                        });
                        
                        let path = `M ${points[0].x} ${points[0].y}`;
                        
                        for (let i = 1; i < points.length; i++) {
                          const prevPoint = points[i - 1];
                          const currentPoint = points[i];
                          const nextPoint = points[i + 1];
                          
                          // Calculate control points for smooth curve
                          const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) / 3;
                          const cp1y = prevPoint.y;
                          const cp2x = currentPoint.x - (nextPoint ? (nextPoint.x - prevPoint.x) / 3 : (currentPoint.x - prevPoint.x) / 3);
                          const cp2y = currentPoint.y;
                          
                          path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`;
                        }
                        
                        return path;
                      };
                      
                      const smoothPath = createSmoothPath(registrationData);
                      const areaPath = smoothPath + ` L 100 100 L 0 100 Z`;
                      
                      return (
                        <>
                          {/* Gradient Definitions */}
                          <defs>
                            {/* Area fill gradient */}
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                              <stop offset="25%" stopColor="#f97316" stopOpacity="0.2" />
                              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
                              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                            </linearGradient>
                            
                            {/* Line gradient */}
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="25%" stopColor="#f97316" />
                              <stop offset="50%" stopColor="#8b5cf6" />
                              <stop offset="75%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                            
                            {/* Drop shadow filter */}
                            <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1"/>
                            </filter>
                          </defs>
                          
                          {/* Area fill */}
                          <path
                            d={areaPath}
                            fill="url(#areaGradient)"
                            stroke="none"
                          />
                          
                          {/* Smooth curved line */}
                          <path
                            d={smoothPath}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            filter="url(#dropshadow)"
                          />
                        </>
                      );
                    })()}
                  </svg>

                  {/* Enhanced Data Points */}
                  {registrationData.map((data, index) => {
                    const maxCount = Math.max(...registrationData.map(d => Number(d.registration_count)), 1);
                    const chartMax = Math.ceil(maxCount * 1.5); // 1.5x the max value for better proportions
                    const x = registrationData.length > 1 ? (index / (registrationData.length - 1)) * 100 : 50;
                    const y = 100 - (Number(data.registration_count) / chartMax) * 100;
                    
                    // Determine if this is a peak or valley for special highlighting
                    const isPeak = Number(data.registration_count) === maxCount;
                    const isValley = Number(data.registration_count) === Math.min(...registrationData.map(d => Number(d.registration_count)));
                    
                    // Color based on position in gradient
                    const gradientPosition = index / (registrationData.length - 1);
                    let pointColor = '#ef4444'; // Default red
                    if (gradientPosition < 0.25) pointColor = '#ef4444'; // Red
                    else if (gradientPosition < 0.5) pointColor = '#f97316'; // Orange
                    else if (gradientPosition < 0.75) pointColor = '#8b5cf6'; // Purple
                    else pointColor = '#3b82f6'; // Blue
                    
                    return (
                      <div
                        key={index}
                        className="absolute group"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {/* Enhanced Tooltip */}
                        <div className={`absolute ${isPeak ? '-top-16' : isValley ? '-bottom-16' : '-top-12'} bg-white/95 backdrop-blur-xl text-gray-800 px-3 py-2 rounded-full text-xs font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 whitespace-nowrap border-2 ${
                          isPeak ? 'border-pink-300 bg-pink-50' : 
                          isValley ? 'border-purple-300 bg-purple-50' : 
                          'border-gray-300'
                        }`} style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          <div className="text-center">
                            <div className={`font-bold ${isPeak ? 'text-pink-600' : isValley ? 'text-purple-600' : 'text-gray-700'}`}>
                              {data.registration_count} জন
                            </div>
                            <div className="text-gray-600 text-xs">
                              {new Date(data.registration_date).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          {/* Tooltip arrow */}
                          <div className={`absolute ${isPeak ? 'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent' : 
                            isValley ? 'bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent' : 
                            'top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent'} ${
                            isPeak ? 'border-t-pink-50' : 
                            isValley ? 'border-b-purple-50' : 
                            'border-t-white/95'
                          }`}></div>
                        </div>
                        
                        {/* Enhanced Data Point Circle */}
                        <div 
                          className={`w-5 h-5 rounded-full border-3 border-white shadow-lg group-hover:scale-125 transition-all duration-300 ${
                            isPeak ? 'bg-gradient-to-r from-pink-400 to-pink-600' :
                            isValley ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                            'bg-gradient-to-r from-gray-400 to-gray-600'
                          }`}
                          style={{
                            background: isPeak || isValley ? undefined : `linear-gradient(45deg, ${pointColor}, ${pointColor}dd)`
                          }}
                        >
                          {/* Inner glow effect */}
                          <div className="w-full h-full rounded-full bg-white/20"></div>
                        </div>
                        
                        {/* Connecting line to tooltip */}
                        {(isPeak || isValley) && (
                          <div 
                            className={`absolute w-px bg-gradient-to-b ${
                              isPeak ? 'from-pink-300 to-pink-500' : 'from-purple-300 to-purple-500'
                            } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                            style={{
                              height: isPeak ? '12px' : '12px',
                              top: isPeak ? '-12px' : '12px',
                              left: '50%',
                              transform: 'translateX(-50%)'
                            }}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X-axis Labels */}
                <div className="absolute bottom-0 left-10 right-0 h-8 flex justify-between items-end">
                  {registrationData.map((data, index) => {
                    const date = new Date(data.registration_date);
                    const formattedDate = date.toLocaleDateString('bn-BD', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    
                    return (
                      <div
                        key={index}
                        className="text-xs text-gray-600 font-medium text-center"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        {formattedDate}
                      </div>
                    );
                  })}
                </div>

                {/* X-axis Label */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 text-sm font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  Date
                </div>
              </div>
              
              {/* Chart Summary */}
              <div className="mt-6 pt-4 border-t border-gray-300/50">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {registrationData.length}
                    </div>
                    <div className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      মোট দিন
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {registrationData.reduce((sum, data) => sum + Number(data.registration_count), 0)}
                    </div>
                    <div className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      মোট নিবন্ধন
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-red-500/25 border border-red-500/30">
                <span className="text-red-600 text-2xl">📈</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                এখনও কোন নিবন্ধন ডেটা নেই
              </h4>
              <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ছাত্র নিবন্ধন শুরু হলে এখানে লাইন চার্ট দেখতে পাবেন
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Exams */}
      <div className="bg-white/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            সাম্প্রতিক পরীক্ষা
          </h3>
          <button 
            onClick={() => setActiveTab('exams')}
            className="text-gray-700 hover:text-yellow-600 text-sm font-medium transition-colors bg-yellow-500/20 px-4 py-2 rounded-lg hover:bg-yellow-500/30 border border-yellow-500/50 backdrop-blur-xl"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            সব দেখুন →
          </button>
        </div>
        
        <div className="space-y-4">
          {exams.slice(0, 3).map((exam) => (
            <div key={exam.id} className="bg-white/60 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-4 hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:border-yellow-400/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.exam_name}
                  </h4>
                  <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    প্রশ্ন সংখ্যা: {exam.question_count} | বছর: {exam.year}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-600 font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.class_count} ক্লাস
                  </p>
                  <p className="text-gray-500 text-xs" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {new Date(exam.created_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Exams List */}
      <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            সব পরীক্ষা
          </h3>
          <button 
            onClick={() => setActiveTab('exams')}
            className="text-gray-700 hover:text-green-600 text-sm font-medium transition-colors bg-green-500/20 px-4 py-2 rounded-lg hover:bg-green-500/30 border border-green-500/50 backdrop-blur-xl"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            সব দেখুন →
          </button>
        </div>
        
        <div className="space-y-4">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <div key={exam.id} className="bg-white/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:border-green-400/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {exam.exam_name}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        প্রশ্ন সংখ্যা: {exam.question_count}
                      </span>
                      <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        বছর: {exam.year}
                      </span>
                      <span style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {new Date(exam.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-sm font-medium border border-green-500/50 backdrop-blur-xl">
                      {exam.class_count} ক্লাস
                    </span>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditExam(exam)}
                        className="text-gray-700 hover:text-green-600 text-sm font-medium bg-green-500/20 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/50 backdrop-blur-xl"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        সম্পাদনা
                      </button>
                      <button 
                        onClick={() => handleManageSets(exam)}
                        className="text-gray-700 hover:text-blue-600 text-sm font-medium bg-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/50 backdrop-blur-xl"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        ক্লাস
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/25 border border-green-500/30">
                <span className="text-green-600 text-2xl">📝</span>
              </div>
              <h4 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                এখনও কোন পরীক্ষা নেই
              </h4>
              <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নতুন পরীক্ষা তৈরি করুন
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderExams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          পরীক্ষা ব্যবস্থাপনা
        </h2>
        <button 
          onClick={handleCreateExam}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 border border-green-400/50 backdrop-blur-xl"
          style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
        >
          <span className="mr-2">➕</span>
          নতুন পরীক্ষা
        </button>
      </div>
      
      <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-green-500/30">
                <th className="text-left py-4 px-2 text-gray-800 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  পরীক্ষার নাম
                </th>
                <th className="text-left py-4 px-2 text-gray-800 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  প্রশ্ন সংখ্যা
                </th>
                <th className="text-left py-4 px-2 text-gray-800 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  বছর
                </th>
                <th className="text-left py-4 px-2 text-gray-800 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  ক্লাস সংখ্যা
                </th>
                <th className="text-left py-4 px-2 text-gray-800 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  তৈরি হয়েছে
                </th>
                <th className="text-left py-4 px-2 text-gray-800 font-semibold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  কাজ
                </th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-b border-green-500/20 hover:bg-green-500/10 transition-colors">
                  <td className="py-4 px-2 text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.exam_name}
                  </td>
                  <td className="py-4 px-2 text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.question_count}
                  </td>
                  <td className="py-4 px-2 text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {exam.year}
                  </td>
                  <td className="py-4 px-2">
                    <span className="bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-sm font-medium border border-green-500/50 backdrop-blur-xl">
                      {exam.class_count}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-gray-500 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {new Date(exam.created_at).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditExam(exam)}
                        className="text-gray-700 hover:text-green-600 text-sm font-medium bg-green-500/20 px-3 py-1 rounded-lg hover:bg-green-500/30 transition-colors border border-green-500/50 backdrop-blur-xl"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        সম্পাদনা
                      </button>
                      <button 
                        onClick={() => handleManageSets(exam)}
                        className="text-gray-700 hover:text-blue-600 text-sm font-medium bg-blue-500/20 px-3 py-1 rounded-lg hover:bg-blue-500/30 transition-colors border border-blue-500/50 backdrop-blur-xl"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        ক্লাস
                      </button>
                      <button 
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-gray-700 hover:text-red-600 text-sm font-medium bg-red-500/20 px-3 py-1 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/50 backdrop-blur-xl"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
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
    console.log('Active tab:', activeTab);
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'exams':
        return <ExamManagement />;
      case 'results':
        // console.log('Rendering Results component');
        return <Results userRole="superadmin" />;
      case 'scholarship':
        // console.log('Rendering Scholarship component');
        return <Scholarship />;
      case 'students':
        return <Students userRole="superadmin" />;
      case 'admins':
        return <Admins />;
      case 'finance':
        return <Finance />;
      case 'reminders':
        return renderReminders();
      default:
        return renderOverview();
    }
  };

  // Helper to map numeric class to Bengali
  const bengaliClassName = (cls) => {
    switch (String(cls)) {
      case '6': return 'ষষ্ঠ শ্রেণী';
      case '7': return 'সপ্তম শ্রেণী';
      case '8': return 'অষ্টম শ্রেণী';
      case '9': return 'নবম শ্রেণী';
      case '10': return 'দশম শ্রেণী';
      default: return `শ্রেণী ${cls}`;
    }
  };

  const renderReminders = () => {
    const classes = ['6','7','8','9','10'];

    const handleSend = async () => {
      if (!reminderSelectedClass) {
        if (window.showToast) window.showToast('অনুগ্রহ করে শ্রেণী নির্বাচন করুন', 'error');
        return;
      }
      try {
        setReminderSending(true);
        const resp = await sendClassReminder(reminderSelectedClass, reminderMessage);
        setReminderStats({
          className: bengaliClassName(reminderSelectedClass),
          total: resp?.total ?? 0,
          success: resp?.success ?? 0,
          failed: resp?.failed ?? 0,
          message: reminderMessage,
        });
        setShowReminderModal(true);
      } catch (e) {
        if (window.showToast) window.showToast('SMS পাঠাতে ব্যর্থ', 'error');
      } finally {
        setReminderSending(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            রিমাইন্ডার SMS
          </h2>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শ্রেণী নির্বাচন করুন
              </label>
              <div className="grid grid-cols-3 gap-2">
                {classes.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => setReminderSelectedClass(cls)}
                    className={`px-3 py-2 rounded-lg border text-sm ${reminderSelectedClass === cls ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-800 border-gray-200 hover:border-green-300 hover:bg-green-50'}`}
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    {bengaliClassName(cls)}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                বার্তা
              </label>
              <textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Default বার্তা পরিবর্তন করতে পারেন।</p>
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSend}
              disabled={reminderSending}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
              {reminderSending ? 'পাঠানো হচ্ছে...' : 'SMS পাঠান'}
            </button>
          </div>
          {/* Reminder Result Modal */}
          {showReminderModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                <div className="p-6 border-b border-green-500/20">
                  <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    রিমাইন্ডার পাঠানো হয়েছে
                  </h3>
                  <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {reminderStats?.className} এর শিক্ষার্থীদের কাছে নিম্নলিখিত বার্তা পাঠানো হয়েছে
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="text-xs text-gray-600 mb-1">বার্তা</div>
                    <div className="text-gray-800 whitespace-pre-wrap">{reminderStats?.message}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-gray-50 border rounded-lg p-4">
                      <div className="text-xs text-gray-500">মোট</div>
                      <div className="text-xl font-bold text-gray-800">{reminderStats?.total}</div>
                    </div>
                    <div className="text-center bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-xs text-green-700">সফল</div>
                      <div className="text-xl font-bold text-green-700">{reminderStats?.success}</div>
                    </div>
                    <div className="text-center bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-xs text-red-700">ব্যর্থ</div>
                      <div className="text-xl font-bold text-red-700">{reminderStats?.failed}</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => { setShowReminderModal(false); setReminderStats(null); setActiveTab('reminders'); }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-6 shadow-lg shadow-green-500/25"></div>
          <p className="text-gray-800 text-xl font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            লোড হচ্ছে...
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-green-500/20 sticky top-0 z-50 shadow-lg shadow-green-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-green-500/25">
                <span className="text-white text-xl font-bold">SA</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 drop-shadow-sm" 
                  style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                সুপার অ্যাডমিন ড্যাশবোর্ড
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/20 shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">👤</span>
                </div>
                <span className="text-gray-700 font-bold" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  স্বাগতম, {superAdminName || 'সুপার অ্যাডমিন'}
                </span>
              </div>
              <div className="sm:hidden flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-green-500/20 shadow-lg">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">👤</span>
                </div>
                <span className="text-gray-700 font-bold text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  {superAdminName || 'সুপার অ্যাডমিন'}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 px-3 sm:px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 border border-red-400 text-sm sm:text-base"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                <span className="hidden sm:inline">লগআউট</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/70 backdrop-blur-md border-b border-green-500/20 sticky top-20 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-bold transition-all duration-300 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-700 bg-green-50/50 shadow-lg shadow-green-500/10'
                    : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-400 hover:bg-green-50/30'
                }`}
                style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}
              >
                <span className="mr-1 sm:mr-2 text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden xs:inline">{tab.name}</span>
                <span className="xs:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {renderContent()}
      </div>

      {/* Modals */}
      <CreateExamModal
        isOpen={showCreateExamModal}
        onClose={() => setShowCreateExamModal(false)}
        onSuccess={handleModalSuccess}
      />

      <EditExamModal
        isOpen={showEditExamModal}
        onClose={() => setShowEditExamModal(false)}
        onSuccess={handleModalSuccess}
        onEditSet={handleEditSet}
        exam={selectedExam}
      />

      <SetManagementModal
        isOpen={showSetManagementModal}
        onClose={() => {
          setShowSetManagementModal(false);
          setEditingSet(null);
        }}
        onSuccess={handleModalSuccess}
        exam={selectedExam}
        editingSet={editingSet}
      />
      </div>
    </ToastProvider>
  );
};


export default SuperAdminDashboard;
