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

const getPositionBadge = (index) => {
  if (index === 0) return { bg: 'bg-yellow-100 border-yellow-400 text-yellow-800', icon: '🥇' };
  if (index === 1) return { bg: 'bg-gray-100 border-gray-400 text-gray-700',   icon: '🥈' };
  if (index === 2) return { bg: 'bg-orange-100 border-orange-400 text-orange-800', icon: '🥉' };
  return { bg: 'bg-purple-50 border-purple-300 text-purple-700', icon: `${index + 1}` };
};

const ScoreBar = ({ value, max, color }) => (
  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
    <div
      className={`h-1.5 rounded-full ${color}`}
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
);

const ScholarshipClassModal = ({ isOpen, onClose, allResults, availableClasses }) => {
  if (!isOpen) return null;

  // Derive available classes from passed results if not provided
  const classes = availableClasses?.length
    ? availableClasses
    : [...new Set(allResults.map((r) => r.class))].sort((a, b) => Number(a) - Number(b));

  // Group students by class, sorted by score desc within each class
  const grouped = classes.reduce((acc, cls) => {
    const students = allResults
      .filter((r) => String(r.class) === String(cls))
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    if (students.length > 0) acc[cls] = students;
    return acc;
  }, {});

  const totalStudents = allResults.length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white/95 backdrop-blur-xl border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-500/25 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-b border-purple-500/20 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              🎓 বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তালিকা
            </h2>
            <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              মোট বৃত্তিপ্রাপ্ত: <span className="font-semibold text-purple-700">{totalStudents} জন</span>
              &nbsp;|&nbsp; শ্রেণী সংখ্যা: <span className="font-semibold text-purple-700">{Object.keys(grouped).length} টি</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              কোনো বৃত্তিপ্রাপ্ত শিক্ষার্থী পাওয়া যায়নি
            </div>
          ) : (
            Object.entries(grouped).map(([cls, students]) => (
              <div key={cls} className="border border-purple-200 rounded-2xl overflow-hidden shadow-sm">

                {/* Class header band */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    📚 {bengaliClassName(cls)}
                  </h3>
                  <span className="bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {students.length} জন
                  </span>
                </div>

                {/* Student cards grid */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50/30">
                  {students.map((student, index) => {
                    const badge = getPositionBadge(index);
                    const pct = parseFloat(student.percentage || 0);
                    const totalQ = student.total_questions || 100;

                    return (
                      <div
                        key={student.student_id || student.id || index}
                        className="bg-white rounded-xl border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 p-4 flex flex-col gap-3"
                      >
                        {/* Top row: position badge + name + roll */}
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 ${badge.bg} flex items-center justify-center text-base font-bold`}>
                            {badge.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-800 truncate" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              রোল: <span className="font-semibold text-gray-700">{student.roll_number}</span>
                            </p>
                          </div>
                          {/* Percentage pill */}
                          <span className={`flex-shrink-0 text-sm font-bold px-2 py-0.5 rounded-full border ${
                            pct >= 80 ? 'bg-green-100 border-green-400 text-green-800' :
                            pct >= 60 ? 'bg-blue-100 border-blue-400 text-blue-800' :
                            pct >= 40 ? 'bg-yellow-100 border-yellow-400 text-yellow-800' :
                                        'bg-red-100 border-red-400 text-red-800'
                          }`}>
                            {pct.toFixed(1)}%
                          </span>
                        </div>

                        {/* Info row */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                          <div style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            <span className="text-gray-500">স্কুল:</span>{' '}
                            <span className="text-gray-800 font-medium">{student.school}</span>
                          </div>
                          <div style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                            <span className="text-gray-500">পরীক্ষা:</span>{' '}
                            <span className="text-gray-800 font-medium">{student.exam_name || '—'}</span>
                          </div>
                          {student.father_name && (
                            <div style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                              <span className="text-gray-500">পিতা:</span>{' '}
                              <span className="text-gray-800 font-medium">{student.father_name}</span>
                            </div>
                          )}
                          {student.mother_name && (
                            <div style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                              <span className="text-gray-500">মাতা:</span>{' '}
                              <span className="text-gray-800 font-medium">{student.mother_name}</span>
                            </div>
                          )}
                          {student.class_roll && (
                            <div style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                              <span className="text-gray-500">শ্রেণী রোল:</span>{' '}
                              <span className="text-gray-800 font-medium">{student.class_roll}</span>
                            </div>
                          )}
                        </div>

                        {/* Score stats row */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-green-50 border border-green-200 rounded-lg py-1.5">
                            <p className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>সঠিক</p>
                            <p className="font-bold text-green-700">{student.correct}</p>
                            <ScoreBar value={student.correct} max={totalQ} color="bg-green-500" />
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg py-1.5">
                            <p className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>ভুল</p>
                            <p className="font-bold text-red-600">{student.wrong}</p>
                            <ScoreBar value={student.wrong} max={totalQ} color="bg-red-500" />
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg py-1.5">
                            <p className="text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>স্কোর</p>
                            <p className="font-bold text-purple-700">{parseFloat(student.score).toFixed(0)}</p>
                            <ScoreBar value={student.score} max={totalQ} color="bg-purple-500" />
                          </div>
                        </div>

                        {/* Exam year + rank footer */}
                        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
                          <span>
                            {student.year ? `বছর: ${student.year}` : ''}
                          </span>
                          {student.rank && (
                            <span className="font-medium text-purple-500">
                              সামগ্রিক র‍্যাংক: #{student.rank}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end flex-shrink-0 bg-white/80">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-md"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipClassModal;
