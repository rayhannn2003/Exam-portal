import { useState, useEffect } from 'react';
import { getScholarshipResults, markForScholarship, unmarkForScholarship } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';

const Scholarship = () => {
  const [scholarshipResults, setScholarshipResults] = useState([]);
  const [filteredScholarshipResults, setFilteredScholarshipResults] = useState([]);
  const [scholarshipFilterType, setScholarshipFilterType] = useState('all');
  const [scholarshipSelectedClass, setScholarshipSelectedClass] = useState('');
  const [scholarshipSelectedSchool, setScholarshipSelectedSchool] = useState('');
  const [loading, setLoading] = useState(true);
  const [showClassModal, setShowClassModal] = useState(false);
  const [pdfClassSelection, setPdfClassSelection] = useState('');
  const [availableClassesForModal, setAvailableClassesForModal] = useState([]);
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

  useEffect(() => {
    fetchScholarshipResults();
  }, []);

  useEffect(() => {
    filterScholarshipResults();
  }, [scholarshipResults, scholarshipFilterType, scholarshipSelectedClass, scholarshipSelectedSchool]);

  const fetchScholarshipResults = async () => {
    try {
      setLoading(true);
      const data = await getScholarshipResults();
      setScholarshipResults(data);
      setFilteredScholarshipResults(data);
    } catch (err) {
      error('Failed to fetch scholarship results');
    } finally {
      setLoading(false);
    }
  };

  const filterScholarshipResults = () => {
    let filtered = [...scholarshipResults];

    // Apply scholarship filters
    if (scholarshipFilterType === 'class' && scholarshipSelectedClass) {
      filtered = filtered.filter(result => result.class === scholarshipSelectedClass);
    } else if (scholarshipFilterType === 'school' && scholarshipSelectedSchool) {
      filtered = filtered.filter(result => result.school === scholarshipSelectedSchool);
    } else if (scholarshipFilterType === 'school-class' && scholarshipSelectedSchool && scholarshipSelectedClass) {
      filtered = filtered.filter(result => 
        result.school === scholarshipSelectedSchool && result.class === scholarshipSelectedClass
      );
    }

    setFilteredScholarshipResults(filtered);
  };

  const handleUnmarkForScholarship = async (studentId, studentName) => {
    try {
      await unmarkForScholarship(studentId);
      success(`${studentName} কে বৃত্তির তালিকা থেকে সরানো হয়েছে`);
      fetchScholarshipResults(); // Refresh scholarship results
    } catch (err) {
      error('বৃত্তির তালিকা থেকে সরাতে ব্যর্থ');
    }
  };

  const downloadScholarshipPDF = async () => {
    const scholarshipData = filteredScholarshipResults;
    if (scholarshipData.length === 0) {
      error('ডাউনলোড করার জন্য কোন বৃত্তিপ্রাপ্ত ছাত্র নেই');
      return;
    }
    const available = [...new Set(scholarshipData.map(r => r.class))].sort();
    if (available.length === 0) {
      error('কোন শ্রেণীর ডেটা পাওয়া যায়নি');
      return;
    }
    setAvailableClassesForModal(available);
    setPdfClassSelection('');
    setShowClassModal(true);
  };

  const handleGeneratePdf = async (originalClassName) => {
    const scholarshipData = filteredScholarshipResults;
    // Filter students for selected class (use original numeric class name)
    const classStudents = scholarshipData.filter(student => student.class === originalClassName);
    if (classStudents.length === 0) {
      error(`${bengaliClassName(originalClassName)} এর জন্য কোন বৃত্তিপ্রাপ্ত ছাত্র নেই`);
      return;
    }
    try {
      const scholarshipStudents = classStudents.map((student, index) => ({
        serial_no: index + 1,
        name: student.name,
        school: student.school,
        roll_number: student.roll_number
      }));

      const scholarshipRequest = {
        class_name: `${bengaliClassName(originalClassName)}`,
        students: scholarshipStudents,
        exam_name: "উপবৃত্তি পরীক্ষা - ২০২৫",
        organization_name: "উত্তর তারাবুনিয়া ছাত্র-কল্যাণ সংগঠন",
        motto: "দৃষ্টিভঙ্গি বদলান, জীবন বদলে যাবে",
        established_year: "২০০৪ ইং",
        location: "উত্তর তারাবুনিয়া, সখিপুর, শরিয়তপুর, বাংলাদেশ"
      };

      const response = await fetch('https://ahmfuad.pythonanywhere.com/generate-scholarship-pdf/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scholarshipRequest)
      });

      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `বৃত্তিপ্রাপ্ত_ছাত্রদের_তালিকা_${bengaliClassName(originalClassName)}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success(`${bengaliClassName(originalClassName)} এর তালিকা PDF ডাউনলোড শুরু হয়েছে`);
      setShowClassModal(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      error('PDF ডাউনলোড করতে ব্যর্থ। দয়া করে আবার চেষ্টা করুন।');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          🎓 বৃত্তি ব্যবস্থাপনা
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            মোট বৃত্তিপ্রাপ্ত: {filteredScholarshipResults.length} জন
          </div>
          <button
            onClick={downloadScholarshipPDF}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 z-10 relative"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            disabled={false}
          >
            <span className="text-lg">📄</span>
            <span className="font-semibold">PDF ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Scholarship Filters */}
      <div className="bg-white/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              ফিল্টার ধরন
            </label>
            <select
              value={scholarshipFilterType}
              onChange={(e) => {
                setScholarshipFilterType(e.target.value);
                setScholarshipSelectedClass('');
                setScholarshipSelectedSchool('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">সব বৃত্তিপ্রাপ্ত</option>
              <option value="class">শ্রেণী অনুযায়ী</option>
              <option value="school">স্কুল অনুযায়ী</option>
              <option value="school-class">স্কুল ও শ্রেণী অনুযায়ী</option>
            </select>
          </div>

          {scholarshipFilterType === 'class' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শ্রেণী নির্বাচন করুন
              </label>
              <select
                value={scholarshipSelectedClass}
                onChange={(e) => setScholarshipSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">সব শ্রেণী</option>
                {[...new Set(scholarshipResults.map(r => r.class))].sort().map(cls => (
                  <option key={cls} value={cls}>{bengaliClassName(cls)}</option>
                ))}
              </select>
            </div>
          )}

          {scholarshipFilterType === 'school' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                স্কুল নির্বাচন করুন
              </label>
              <select
                value={scholarshipSelectedSchool}
                onChange={(e) => setScholarshipSelectedSchool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">সব স্কুল</option>
                {[...new Set(scholarshipResults.map(r => r.school))].sort().map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>
          )}

          {scholarshipFilterType === 'school-class' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  স্কুল নির্বাচন করুন
                </label>
                <select
                  value={scholarshipSelectedSchool}
                  onChange={(e) => {
                    setScholarshipSelectedSchool(e.target.value);
                    setScholarshipSelectedClass('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">স্কুল নির্বাচন করুন</option>
                  {[...new Set(scholarshipResults.map(r => r.school))].sort().map(school => (
                    <option key={school} value={school}>{school}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  শ্রেণী নির্বাচন করুন
                </label>
                <select
                  value={scholarshipSelectedClass}
                  onChange={(e) => setScholarshipSelectedClass(e.target.value)}
                  disabled={!scholarshipSelectedSchool}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">শ্রেণী নির্বাচন করুন</option>
                  {scholarshipSelectedSchool && [...new Set(scholarshipResults.filter(r => r.school === scholarshipSelectedSchool).map(r => r.class))].sort().map(cls => (
                    <option key={cls} value={cls}>{bengaliClassName(cls)}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scholarship Results Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/25 transition-all duration-500">
        {filteredScholarshipResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-2xl">🎓</span>
            </div>
            <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {scholarshipFilterType !== 'all' ? 'এই ফিল্টারে কোন বৃত্তিপ্রাপ্ত ছাত্র নেই' : 'কোন বৃত্তিপ্রাপ্ত ছাত্র নেই'}
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
                    স্কুল
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শ্রেণী
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    সঠিক
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ভুল
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    স্কোর
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শতাংশ
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    বৃত্তি বাতিল
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredScholarshipResults.map((result, index) => (
                  <tr key={result.id} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                    <td className="py-3 px-2 text-gray-800 font-medium">
                      {result.roll_number}
                    </td>
                    <td className="py-3 px-2 text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {result.name}
                    </td>
                    <td className="py-3 px-2 text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {result.school}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      {bengaliClassName(result.class)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {result.correct}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        {result.wrong}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-medium text-gray-800">
                      {result.score}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {result.percentage}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleUnmarkForScholarship(result.student_id, result.name)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors border border-red-300"
                        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                      >
                        🚫 বাতিল করুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Class Select Modal for PDF */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-purple-500/20">
              <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                শ্রেণী নির্বাচন করুন
              </h3>
              <p className="text-gray-600 text-sm mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                যেকোন একটি শ্রেণী নির্বাচন করে PDF ডাউনলোড করুন
              </p>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              {['6','7','8','9','10'].map((cls) => {
                const available = availableClassesForModal.includes(cls);
                return (
                  <button
                    key={cls}
                    onClick={() => available && setPdfClassSelection(cls)}
                    className={`px-4 py-3 rounded-lg border transition-all text-center ${
                      pdfClassSelection === cls ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-800 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    } ${available ? '' : 'opacity-50 cursor-not-allowed'}`}
                    disabled={!available}
                    style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                  >
                    {bengaliClassName(cls)}
                  </button>
                );
              })}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowClassModal(false)}
                className="px-4 py-2 rounded-lg border"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                বাতিল
              </button>
              <button
                onClick={() => pdfClassSelection && handleGeneratePdf(pdfClassSelection)}
                disabled={!pdfClassSelection}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                PDF ডাউনলোড
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarship;
