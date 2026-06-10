import { useEffect, useState } from 'react';
import { getLatestExamDetails, downloadExamClassPDF, getStudentByRoll, changeStudentPassword, verifyStudentPassword, downloadAdmitCardFlask } from '../assets/services/api';
import ToastContainer from '../components/ToastContainer';
import PDFLoadingModal from '../components/PDFLoadingModal';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('exam');
  const [examDetails, setExamDetails] = useState(null);
  const [student, setStudent] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [showAdmitCardLoadingModal, setShowAdmitCardLoadingModal] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const showToast = (message, type = 'error', duration = 3000) => {
    if (window && typeof window.showToast === 'function') {
      window.showToast(message, type, duration);
    } else {
      // Fallback if toast system is not mounted yet
      alert(message);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const roll = localStorage.getItem('username');
        if (roll) {
          const s = await getStudentByRoll(roll);
          setStudent(s);
        }
        const details = await getLatestExamDetails();
        setExamDetails(details);
      } catch (e) {
        console.error('Failed to load student dashboard data');
      }
    })();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    showToast('সফলভাবে লগআউট হয়েছেন!', 'success');
    window.location.href = '/';
  };

  const handleDownloadAdmit = async () => {
    try {
      if (!student) return;
      setDownloading(true);
      setShowAdmitCardLoadingModal(true);
      const payload = {
        student_name: student.name,
        school: student.school || 'N/A',
        class_name: String(student.class || ''),
        roll_number: String(student.roll_number),
        exam_name: examDetails?.exam_name || 'বৃত্তি পরীক্ষা',
        exam_date: '৭ নভেম্বর, ২০২৫',
        exam_time: 'সকাল ৯ টা থেকে ১০ টা পর্যন্ত',
        center_name: 'আব্বাস আলী উচ্চ বিদ্যালয়',
        instructions: 'পরীক্ষার সময় অ্যাডমিট কার্ড সাথে আনতে হবে এবং পরীক্ষার সকল নিয়ম মেনে চলতে হবে।'
      };
      const blob = await downloadAdmitCardFlask(payload);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Admit_${student.roll_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('অ্যাডমিট কার্ড ডাউনলোড শুরু হয়েছে', 'success');
    } catch (e) {
      console.error('Admit download failed', e);
      showToast(e?.message || 'ডাউনলোড ব্যর্থ হয়েছে', 'error');
    } finally {
      setDownloading(false);
      setShowAdmitCardLoadingModal(false);
    }
  };

  const handleSavePassword = async () => {
    try {
      if (!student) return;
      if (!oldPassword || !newPassword) {
        return showToast('পুরনো এবং নতুন পাসওয়ার্ড দিন', 'error');
      }
      setSavingPwd(true);
      // Pre-verify old password for nicer error and to prevent hitting change endpoint on 401
      const verify = await verifyStudentPassword({ roll_number: student.roll_number, old_password: oldPassword })
        .catch((verr) => {
          const msg = verr?.message || 'পুরনো পাসওয়ার্ড সঠিক নয়';
          showToast(msg, 'error');
          return null;
        });
      if (!verify || verify?.valid !== true) {
        return; // stop if verification failed
      }

      await changeStudentPassword({ roll_number: student.roll_number, old_password: oldPassword, new_password: newPassword })
        .catch((err) => {
          const msg = err?.status === 401 ? 'পুরনো পাসওয়ার্ড সঠিক নয়' : (err?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ');
          showToast(msg, 'error');
          throw err; // rethrow to go to outer catch/finally for state reset
        });
      setOldPassword('');
      setNewPassword('');
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে', 'success');
    } catch (e) {
      // already handled above; keep silent fallback
    } finally {
      setSavingPwd(false);
    }
  };

  const renderExam = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>পরীক্ষার তথ্য</h2>
        {examDetails ? (
          <div className="space-y-3 text-gray-800">
            <div className="text-xl font-extrabold">সংগঠনঃ উত্তর তারাবুনিয়া ছাত্রকল্যাণ সংগঠন</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-base sm:text-lg"><span className="font-semibold">নাম:</span> {examDetails.exam_name}</div>
              <div className="text-base sm:text-lg"><span className="font-semibold">বছর:</span> ২০২৫</div>
              <div className="text-base sm:text-lg"><span className="font-semibold">তারিখ:</span> ৭ নভেম্বর, ২০২৫</div>
               <div className="text-base sm:text-lg"><span className="font-semibold">দিন:</span> শুক্রবার</div>
              <div className="text-base sm:text-lg"><span className="font-semibold">সময়:</span> সকাল ৯ টা থেকে ১০ টা পর্যন্ত</div>
              <div className="text-base sm:text-lg"><span className="font-semibold">ফল প্রকাশ:</span> ৯ নভেম্বর, ২০২৫, সন্ধ্যাবেলা</div>
              <div className="text-base sm:text-lg"><span className="font-semibold">কেন্দ্রঃ</span> আব্বাস আলী উচ্চ বিদ্যালয়</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">তথ্য লোড হচ্ছে...</div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>অ্যাডমিট কার্ড</h3>
            <p className="text-gray-600 text-sm">পরীক্ষায় অংশগ্রহণের জন্য আবশ্যক</p>
          </div>
          <button onClick={handleDownloadAdmit} disabled={downloading} className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            {downloading ? 'ডাউনলোড হচ্ছে...' : 'ডাউনলোড'}
          </button>
        </div>

        <div className="bg-yellow-50/60 border border-yellow-200 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            📋 অ্যাডমিট কার্ড ব্যবহারের নির্দেশনা
          </h4>
          <div className="space-y-2 text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            <div className="flex items-start space-x-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">১</span>
              <span><strong>PDF ডাউনলোড করুন:</strong> উপরের "ডাউনলোড" বাটনে ক্লিক করে অ্যাডমিট কার্ডের PDF ফাইল ডাউনলোড করুন</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">২</span>
              <span><strong>PDF প্রিন্ট করুন:</strong> ডাউনলোড করা PDF ফাইলটি কালো-সাদা বা রঙিন প্রিন্টারে প্রিন্ট করুন</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">৩</span>
              <span><strong>পরীক্ষার হলে আনুন:</strong> প্রিন্ট করা অ্যাডমিট কার্ডটি পরীক্ষার দিন অবশ্যই সাথে আনুন</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">৪</span>
              <span><strong>প্রদর্শন করুন:</strong> পরীক্ষার হলে প্রবেশের সময় অ্যাডমিট কার্ডটি পরীক্ষককে প্রদর্শন করুন</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              ⚠️ <strong>সতর্কতা:</strong> অ্যাডমিট কার্ড ছাড়া পরীক্ষার হলে প্রবেশ করা যাবে না। অনুগ্রহ করে সময়মতো ডাউনলোড ও প্রিন্ট করে রাখুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTips = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>📝 পরীক্ষার্থীদের জন্য নির্দেশনা (OMR শীটের জন্য)</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-800 text-base" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
          <li>শুধুমাত্র কালো বল পেন (Black Ball Point Pen) ব্যবহার করতে হবে।</li>
          <li>বৃত্ত সম্পূর্ণভাবে ও সমানভাবে পূরণ করুন। অর্ধেক বা অসমানভাবে পূরণ করলে তা সঠিকভাবে স্ক্যান নাও হতে পারে।</li>
          <li>একটি প্রশ্নে একাধিক বৃত্ত পূরণ করবেন না। একাধিক বৃত্ত পূরণ করা হলে উত্তরটি অকার্যকর ধরা হবে।</li>
          <li>OMR শীটে কোনো দাগ, লেখা বা চিহ্ন দিবেন না, সুনির্দিষ্ট ক্ষেত্র ছাড়া যেমন: নাম, ক্লাস, রোল নাম্বার।</li>
          <li>OMR শীটের চারটি কর্ণার এ কালো বক্সকে কোনোভাবেই কেটে, মুছে বা দাগ দেওয়া যাবে না।</li>
          <li>শীট ভাঁজ করবেন না, ভিজাবেন না এবং স্ট্যাপলার ব্যবহার করবেন না।</li>
          <li>আপনার নাম, রোল নাম্বার ও অন্যান্য তথ্য পরিষ্কারভাবে লিখুন।</li>
          <li>ভুল বা অসম্পূর্ণভাবে রোল নাম্বার পূরণ করলে আপনার OMR শীট বাতিল বা ডিসকার্ড করা হবে।</li>
          <li>পরীক্ষার সময় শান্তভাবে ও মনোযোগ দিয়ে উত্তর পূরণ করুন।</li>
          <li>OMR শীট জমা দেওয়ার আগে সব তথ্য ও বৃত্তগুলো ভালোভাবে যাচাই করুন।</li>
        </ul>

        <div className="mt-6 pt-6 border-t border-blue-200/50">
          <h3 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>ডেমো OMR শীট (সঠিকভাবে পূরণ করা)</h3>
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
            <div className="overflow-hidden rounded-xl border border-blue-200 shadow">
              <img
                src="/omr-format.jpeg"
                alt="ডেমো OMR শীট"
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              রেফারেন্সের জন্য প্রদত্ত — ছবিতে দেখানো নিয়মে বৃত্তগুলো সমানভাবে ও পরিষ্কারভাবে পূরণ করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to map numeric class to Bengali
  const getBengaliClassName = (classNum) => {
    const classMap = {
      '6': 'ষষ্ঠ শ্রেণি',
      '7': 'সপ্তম শ্রেণি',
      '8': 'অষ্টম শ্রেণি',
      '9': 'নবম শ্রেণি',
      '10': 'দশম শ্রেণি'
    };
    return classMap[String(classNum)] || `শ্রেণী ${classNum}`;
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>প্রোফাইল</h2>
        {student ? (
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div><span className="font-semibold">নাম:</span> {student.name}</div>
            <div><span className="font-semibold">বৃত্তি রোল:</span> {student.roll_number}</div>
            <div><span className="font-semibold">স্কুল:</span> {student.school}</div>
            <div><span className="font-semibold">শ্রেণী:</span> {getBengaliClassName(student.class)}</div>
            <div><span className="font-semibold">ফোন:</span> {student.phone}</div>
          </div>
        ) : (
          <div className="text-gray-600">তথ্য লোড হচ্ছে...</div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>পাসওয়ার্ড পরিবর্তন</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              placeholder="পুরনো পাসওয়ার্ড"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
            >
              {showOldPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.62 6.62m3.258 3.258l4.242 4.242M9.878 9.878V6.62m4.242 4.242L18.36 18.36M14.12 14.12v3.258" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="নতুন পাসওয়ার্ড"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
            >
              {showNewPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.62 6.62m3.258 3.258l4.242 4.242M9.878 9.878V6.62m4.242 4.242L18.36 18.36M14.12 14.12v3.258" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button onClick={handleSavePassword} disabled={savingPwd} className="px-5 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
            {savingPwd ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">নিরাপত্তার জন্য একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'exam':
        return renderExam();
      case 'tips':
        return renderTips();
      case 'profile':
        return renderProfile();
      default:
        return renderExam();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 relative overflow-hidden">
      <ToastContainer />
      <div className="bg-white/80 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <span className="text-white text-xl font-bold">SD</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                স্টুডেন্ট ড্যাশবোর্ড
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-gray-700 font-bold hidden sm:block" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                স্বাগতম, {student?.name || 'ছাত্র'}
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-2 px-3 sm:px-5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-md border border-red-400 text-sm"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md border-b border-emerald-500/20 sticky top-20 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'exam', name: 'পরীক্ষা', icon: '📄' },
              { id: 'tips', name: 'টিপস', icon: '💡' },
              { id: 'profile', name: 'প্রোফাইল', icon: '👤' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-3 sm:px-5 text-sm sm:text-base font-bold transition-all duration-300 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-gray-700 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50/30'}`}
                style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 'bold' }}>
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {renderContent()}
      </div>

      {/* PDF Loading Modal for Admit Card */}
      <PDFLoadingModal
        isOpen={showAdmitCardLoadingModal}
        onClose={() => setShowAdmitCardLoadingModal(false)}
        title="অ্যাডমিট কার্ড তৈরি হচ্ছে"
        message="আপনার অ্যাডমিট কার্ডের PDF তৈরি করা হচ্ছে"
        type="admit"
      />
    </div>
  );
};

export default StudentDashboard;


