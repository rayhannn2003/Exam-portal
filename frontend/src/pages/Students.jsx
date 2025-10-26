import { useState, useEffect } from 'react';
import { getAllStudents, getStudentByRoll, getStudentsByClass, getStudentsBySchool, getStudentsBySchoolAndClass, deleteStudent, updateStudent } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';
import RegisterStudentModal from '../components/RegisterStudentModal';
import EditStudentModal from '../components/EditStudentModal';

const Students = ({ userRole = 'superadmin' }) => {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const { success, error } = useToast();

  // Map numeric class to Bengali name
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
    success(`ছাত্র নিবন্ধন সফল! রোল নম্বর: ${response.student.roll_number}`);
    setRegisteredStudent(response.student);
    setShowSuccessModal(true);
  };

  const handleEditSuccess = () => {
    // Refresh the student list
    fetchStudents();
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
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
                {userRole === 'superadmin' && <option value="roll">রোল নম্বর</option>}
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
          
          {/* Roll Number Search - Only for SuperAdmin */}
          {userRole === 'superadmin' && (
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
          )}
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
                  <option key={cls} value={cls}>{bengaliClassName(cls)}</option>
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
                    <option key={cls} value={cls}>{bengaliClassName(cls)}</option>
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
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    কাজ
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
                      {student.school || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      {student.class ? bengaliClassName(student.class) : 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      {student.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-gray-800">
                      {student.entry_fee !== undefined && student.entry_fee !== null ? `৳${student.entry_fee}` : 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(student.payment_status)}`}>
                        {getPaymentStatusText(student.payment_status)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500 text-sm">
                      {student.created_at ? formatDate(student.created_at) : 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-300"
                          style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                        >
                          সম্পাদনা
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm('আপনি কি নিশ্চিত যে এই ছাত্রকে মুছে ফেলতে চান?')) return;
                            try {
                              await deleteStudent(student.id);
                              success('ছাত্র মুছে ফেলা হয়েছে');
                              fetchStudents();
                            } catch (e) {
                              error('ছাত্র মুছতে ব্যর্থ');
                            }
                          }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-300"
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
        )}
      </div>

      {/* Register Student Modal */}
      <RegisterStudentModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
      />

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingStudent(null);
        }}
        student={editingStudent}
        onSuccess={handleEditSuccess}
      />

      {/* Registration Success Modal */}
      {showSuccessModal && registeredStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-green-500/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-green-500/20">
              <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                নিবন্ধন সম্পন্ন!
              </h3>
              <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                ছাত্রের তথ্য নিচে দেওয়া হল
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>রোল নম্বর</div>
                <div className="text-3xl font-extrabold text-green-700 tracking-wider">
                  {registeredStudent.roll_number}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>নাম</div>
                  <div className="text-gray-800 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{registeredStudent.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>স্কুল</div>
                  <div className="text-gray-800 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{registeredStudent.school}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>শ্রেণী</div>
                  <div className="text-gray-800 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>{bengaliClassName(registeredStudent.class)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>ফি</div>
                  <div className="text-gray-800 font-medium">৳{registeredStudent.entry_fee}</div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => { setShowSuccessModal(false); setRegisteredStudent(null); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
