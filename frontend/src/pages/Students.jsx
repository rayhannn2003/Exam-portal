import { useState, useEffect } from 'react';
import { getAllStudents, getStudentByRoll, getStudentsByClass, getStudentsBySchool, getStudentsBySchoolAndClass } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';
import RegisterStudentModal from '../components/RegisterStudentModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name', 'roll', 'school', 'class', 'school-class'
  const [filterType, setFilterType] = useState('all'); // 'all', 'class', 'school', 'school-class'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [rollSearch, setRollSearch] = useState('');
  const [showRollSearch, setShowRollSearch] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { success, error } = useToast();

  // Unique classes and schools for filters
  const uniqueClasses = [...new Set(students.map(s => s.class))].sort();
  const uniqueSchools = [...new Set(students.map(s => s.school))].sort();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, searchType, filterType, selectedClass, selectedSchool]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student => {
        if (searchType === 'name') {
          return student.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchType === 'roll') {
          return student.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchType === 'school') {
          return student.school.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchType === 'class') {
          return student.class.toString().includes(searchTerm);
        }
        return true;
      });
    }

    // Apply category filters
    if (filterType === 'class' && selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass);
    } else if (filterType === 'school' && selectedSchool) {
      filtered = filtered.filter(student => student.school === selectedSchool);
    } else if (filterType === 'school-class' && selectedSchool && selectedClass) {
      filtered = filtered.filter(student => 
        student.school === selectedSchool && student.class === selectedClass
      );
    }

    setFilteredStudents(filtered);
  };

  const handleRollSearch = async () => {
    if (!rollSearch.trim()) {
      error('Please enter a roll number');
      return;
    }

    try {
      setLoading(true);
      const data = await getStudentByRoll(rollSearch.trim());
      if (data) {
        setFilteredStudents([data]);
        setShowRollSearch(true);
        success(`Found student with roll number: ${rollSearch}`);
      } else {
        error('No student found with this roll number');
        setFilteredStudents([]);
      }
    } catch (err) {
      error('No student found with this roll number');
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSelectedClass('');
    setSelectedSchool('');
    setRollSearch('');
    setShowRollSearch(false);
    setFilteredStudents(students);
  };

  const handleRegisterSuccess = (response) => {
    // Refresh the student list
    fetchStudents();
    success(`Student registered successfully! Roll number: ${response.student.roll_number}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  const getPaymentStatusColor = (status) => {
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getPaymentStatusText = (status) => {
    return status ? 'পরিশোধিত' : 'অপরিশোধিত';
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
          ছাত্র ব্যবস্থাপনা
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            মোট ছাত্র: {filteredStudents.length} জন
          </div>
          <button 
            onClick={() => setShowRegisterModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 border border-green-400/50 backdrop-blur-xl"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            <span className="mr-2">➕</span>
            নতুন ছাত্র নিবন্ধন
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
        {/* Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              অনুসন্ধান করুন
            </label>
            <div className="flex space-x-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name">ছাত্রের নাম</option>
                <option value="roll">রোল নম্বর</option>
                <option value="school">স্কুলের নাম</option>
                <option value="class">শ্রেণী</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  searchType === 'name' ? 'ছাত্রের নাম লিখুন...' :
                  searchType === 'roll' ? 'রোল নম্বর লিখুন...' :
                  searchType === 'school' ? 'স্কুলের নাম লিখুন...' :
                  'শ্রেণী লিখুন...'
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              />
            </div>
          </div>
          
          {/* Roll Number Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              রোল নম্বর দিয়ে খুঁজুন
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={rollSearch}
                onChange={(e) => setRollSearch(e.target.value)}
                placeholder="রোল নম্বর..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              />
              <button
                onClick={handleRollSearch}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
              >
                খুঁজুন
              </button>
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              ফিল্টার ধরন
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setSelectedClass('');
                setSelectedSchool('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">সব ছাত্র</option>
              <option value="class">শ্রেণী অনুযায়ী</option>
              <option value="school">স্কুল অনুযায়ী</option>
              <option value="school-class">স্কুল ও শ্রেণী অনুযায়ী</option>
            </select>
          </div>

          {filterType === 'class' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শ্রেণী নির্বাচন করুন
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">সব শ্রেণী</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>শ্রেণী {cls}</option>
                ))}
              </select>
            </div>
          )}

          {filterType === 'school' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                স্কুল নির্বাচন করুন
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">সব স্কুল</option>
                {uniqueSchools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>
          )}

          {filterType === 'school-class' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  স্কুল নির্বাচন করুন
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value);
                    setSelectedClass('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">স্কুল নির্বাচন করুন</option>
                  {uniqueSchools.map(school => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  শ্রেণী নির্বাচন করুন
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={!selectedSchool}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">শ্রেণী নির্বাচন করুন</option>
                  {selectedSchool && [...new Set(students.filter(s => s.school === selectedSchool).map(s => s.class))].sort().map(cls => (
                    <option key={cls} value={cls}>শ্রেণী {cls}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            ফিল্টার সাফ করুন
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-2xl">👥</span>
            </div>
            <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {searchTerm || rollSearch ? 'কোন ছাত্র পাওয়া যায়নি' : 'কোন ছাত্র নেই'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    রোল নম্বর
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    নাম
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    পিতার নাম
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    স্কুল
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শ্রেণী
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ফোন
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ফি
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    পেমেন্ট
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    নিবন্ধন তারিখ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2 text-gray-800 font-medium">
                      {student.roll_number}
                    </td>
                    <td className="py-3 px-2 text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {student.name}
                    </td>
                    <td className="py-3 px-2 text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {student.father_name || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {student.school}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      শ্রেণী {student.class}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      {student.phone}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-gray-800">
                      ৳{student.entry_fee}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(student.payment_status)}`}>
                        {getPaymentStatusText(student.payment_status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500 text-sm">
                      {formatDate(student.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Student Modal */}
      <RegisterStudentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
      />
    </div>
  );
};

export default Students;
