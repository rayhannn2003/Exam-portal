import { useState, useEffect } from 'react';
import { getFullResults, getResultByStudentRoll, getResultByClass, getResultBySchool } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';
import IndividualResultModal from '../components/IndividualResultModal';

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' or 'school'
  const [filterType, setFilterType] = useState('all'); // 'all', 'class', 'school', 'school-class'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [rollSearch, setRollSearch] = useState('');
  const [showRollSearch, setShowRollSearch] = useState(false);
  const [showIndividualResult, setShowIndividualResult] = useState(false);
  const [individualResultData, setIndividualResultData] = useState([]);
  const { success, error } = useToast();

  // Unique classes and schools for filters
  const uniqueClasses = [...new Set(results.map(r => r.class))].sort();
  const uniqueSchools = [...new Set(results.map(r => r.school))].sort();

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm, searchType, filterType, selectedClass, selectedSchool]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await getFullResults();
      setResults(data);
      setFilteredResults(data);
    } catch (err) {
      error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result => {
        if (searchType === 'name') {
          return result.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchType === 'school') {
          return result.school.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (searchType === 'roll') {
          return result.roll_number.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      });
    }

    // Apply category filters
    if (filterType === 'class' && selectedClass) {
      filtered = filtered.filter(result => result.class === selectedClass);
    } else if (filterType === 'school' && selectedSchool) {
      filtered = filtered.filter(result => result.school === selectedSchool);
    } else if (filterType === 'school-class' && selectedSchool && selectedClass) {
      filtered = filtered.filter(result => 
        result.school === selectedSchool && result.class === selectedClass
      );
    }

    setFilteredResults(filtered);
  };

  const handleRollSearch = async () => {
    if (!rollSearch.trim()) {
      error('Please enter a roll number');
      return;
    }

    try {
      setLoading(true);
      const data = await getResultByStudentRoll(rollSearch.trim());
      if (data.length > 0) {
        setIndividualResultData(data);
        setShowIndividualResult(true);
        success(`Found ${data.length} result(s) for roll number: ${rollSearch}`);
      } else {
        error('No results found for this roll number');
      }
    } catch (err) {
      error('No results found for this roll number');
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
    setFilteredResults(results);
  };

  const getGradeColor = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 80) return 'text-green-600 bg-green-100';
    if (percent >= 60) return 'text-blue-600 bg-blue-100';
    if (percent >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getGradeText = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 80) return 'A+';
    if (percent >= 70) return 'A';
    if (percent >= 60) return 'A-';
    if (percent >= 50) return 'B';
    if (percent >= 40) return 'C';
    return 'F';
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
          ফলাফল ব্যবস্থাপনা
        </h2>
        <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          মোট ফলাফল: {filteredResults.length} টি
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
                <option value="school">স্কুলের নাম</option>
                <option value="roll">রোল নম্বর</option>
              </select>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchType === 'name' ? 'ছাত্রের নাম লিখুন...' : searchType==='school' ? 'স্কুলের নাম লিখুন...' : 'রোল নম্বর লিখুন...'}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              />
            </div>
          </div>
          
          {/* Roll Number Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              রোল নম্বর দিয়ে বিস্তারিত ফলাফল খুঁজুন
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
              <option value="all">সব ফলাফল</option>
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
                  {selectedSchool && [...new Set(results.filter(r => r.school === selectedSchool).map(r => r.class))].sort().map(cls => (
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

      {/* Results Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
        {filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-2xl">📊</span>
            </div>
            <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              {searchTerm || rollSearch ? 'কোন ফলাফল পাওয়া যায়নি' : 'কোন ফলাফল নেই'}
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
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    পরীক্ষা
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
                    গ্রেড
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
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
                      শ্রেণী {result.class}
                    </td>
                    <td className="py-3 px-2 text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {result.title}
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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${getGradeColor(result.percentage)}`}>
                        {getGradeText(result.percentage)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Result Modal */}
      <IndividualResultModal
        isOpen={showIndividualResult}
        onClose={() => {
          setShowIndividualResult(false);
          setIndividualResultData([]);
          setRollSearch('');
        }}
        resultData={individualResultData}
      />
    </div>
  );
};

export default Results;
