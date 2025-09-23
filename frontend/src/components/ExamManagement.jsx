import { useState, useEffect } from 'react';
import { getAllExams, getExamWithSets, deleteExam, addExamSet, editExamSet, deleteExamSet } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';
import CreateExamModal from './CreateExamModal';
import EditExamModal from './EditExamModal';
import SetManagementModal from './SetManagementModal';
import QuestionPreviewModal from './QuestionPreviewModal';

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examSets, setExamSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [showSetManagementModal, setShowSetManagementModal] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [previewSet, setPreviewSet] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await getAllExams();
      setExams(data);
    } catch (err) {
      error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamSets = async (examId) => {
    try {
      const examData = await getExamWithSets(examId);
      setExamSets(examData.sets || []);
    } catch (err) {
      error('Failed to fetch exam sets');
    }
  };

  const handleExamClick = async (exam) => {
    setSelectedExam(exam);
    await fetchExamSets(exam.id);
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
        await fetchExams();
        if (selectedExam && selectedExam.id === examId) {
          setSelectedExam(null);
          setExamSets([]);
        }
        success('Exam deleted successfully');
      } catch (err) {
        error('Failed to delete exam');
      }
    }
  };

  const handleManageSets = async (exam) => {
    try {
      const examWithSets = await getExamWithSets(exam.id);
      setSelectedExam(examWithSets);
      setShowSetManagementModal(true);
    } catch (err) {
      error('Failed to fetch exam details');
    }
  };

  const handleEditSet = (set) => {
    setEditingSet(set);
    setShowSetManagementModal(true);
  };

  const handleDeleteSet = async (setId) => {
    if (window.confirm('Are you sure you want to delete this exam set?')) {
      try {
        await deleteExamSet(selectedExam.id, setId);
        await fetchExamSets(selectedExam.id);
        success('Exam set deleted successfully');
      } catch (err) {
        error('Failed to delete exam set');
      }
    }
  };

  const handlePreviewSet = (set) => {
    setPreviewSet(set);
    setShowQuestionPreview(true);
  };

  const handleModalSuccess = () => {
    fetchExams();
    if (selectedExam) {
      fetchExamSets(selectedExam.id);
    }
    success('Operation completed successfully');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Exams List */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              পরীক্ষার তালিকা
            </h3>
            
            {exams.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 text-2xl">📝</span>
                </div>
                <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  এখনও কোন পরীক্ষা নেই
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.map((exam, index) => (
                  <div
                    key={exam.id}
                    onClick={() => handleExamClick(exam)}
                    className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedExam?.id === exam.id
                        ? 'bg-green-500/20 border-2 border-green-500/50 shadow-lg shadow-green-500/25'
                        : 'bg-white/60 border border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-lg font-semibold text-gray-800 truncate" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          {index + 1}. {exam.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          শ্রেণী: {exam.class} | প্রশ্ন: {exam.question_count || 0} | সেট: {exam.set_count || 0}
                        </p>
                        <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          বছর: {exam.year}
                        </p>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditExam(exam);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Exam"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteExam(exam.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Exam"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sets Management */}
        <div className="lg:col-span-2">
          {selectedExam ? (
            <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    {selectedExam.title} - সেট ব্যবস্থাপনা
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    শ্রেণী: {selectedExam.class} | প্রশ্ন সংখ্যা: {selectedExam.question_count || 0}
                  </p>
                </div>
                <button
                  onClick={() => handleManageSets(selectedExam)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25 text-sm sm:text-base"
                  style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
                >
                  <span className="mr-1 sm:mr-2">➕</span>
                  <span className="hidden sm:inline">সেট যোগ করুন</span>
                  <span className="sm:hidden">সেট যোগ</span>
                </button>
              </div>

              {examSets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 text-2xl">📚</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    এখনও কোন সেট নেই
                  </h4>
                  <p className="text-gray-600 text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    সেট যোগ করুন
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {examSets.map((set) => (
                    <div key={set.id} className="bg-white/60 backdrop-blur-sm border border-green-500/20 rounded-xl p-3 sm:p-4 hover:shadow-lg hover:shadow-green-500/25 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex-1 min-w-0" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                          সেট {set.set_name}
                        </h4>
                        <div className="flex space-x-1 sm:space-x-2 ml-2">
                          <button
                            onClick={() => handlePreviewSet(set)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Preview Questions"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditSet(set)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit Set"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSet(set.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Set"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        {set.questions ? set.questions.length : 0} টি প্রশ্ন
                      </p>
                      <div className="mt-2 text-xs text-gray-500" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                        তৈরি: {new Date(set.created_at).toLocaleDateString('bn-BD')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-12 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-green-600 text-2xl">👆</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  একটি পরীক্ষা নির্বাচন করুন
                </h3>
                <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                  সেট ব্যবস্থাপনার জন্য বাম দিক থেকে একটি পরীক্ষা নির্বাচন করুন
                </p>
              </div>
            </div>
          )}
        </div>
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

      <QuestionPreviewModal
        isOpen={showQuestionPreview}
        onClose={() => {
          setShowQuestionPreview(false);
          setPreviewSet(null);
        }}
        examSet={previewSet}
      />
    </div>
  );
};

export default ExamManagement;
