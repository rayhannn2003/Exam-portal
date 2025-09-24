import { useState, useEffect } from 'react';
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '../assets/services/api';
import { useToast } from '../contexts/ToastContext';
import CreateAdminModal from '../components/CreateAdminModal';
import EditAdminModal from '../components/EditAdminModal';

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (err) {
      error('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = (response) => {
    fetchAdmins();
    success('Admin created successfully!');
  };

  const handleEditSuccess = (response) => {
    fetchAdmins();
    success('Admin updated successfully!');
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Are you sure you want to delete admin "${admin.name}"?`)) {
      return;
    }

    try {
      setDeletingId(admin.id);
      await deleteAdmin(admin.id);
      fetchAdmins();
      success('Admin deleted successfully!');
    } catch (err) {
      error(err.message || 'Failed to delete admin');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD');
  };

  const getRoleColor = (role) => {
    return role === 'super_admin' ? 'text-purple-600 bg-purple-100' : 'text-blue-600 bg-blue-100';
  };

  const getRoleText = (role) => {
    return role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'অ্যাডমিন';
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
          অ্যাডমিন ব্যবস্থাপনা
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
            মোট অ্যাডমিন: {admins.length} জন
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 border border-green-400/50 backdrop-blur-xl"
            style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
          >
            <span className="mr-2">➕</span>
            নতুন অ্যাডমিন তৈরি করুন
          </button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-500">
        {admins.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-2xl">👨‍💼</span>
            </div>
            <p className="text-gray-600" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
              কোন অ্যাডমিন নেই
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    নাম
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ব্যবহারকারীর নাম
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    ভূমিকা
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    তৈরি তারিখ
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                    কর্ম
                  </th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2 text-gray-800 font-medium" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                      {admin.name}
                    </td>
                    <td className="py-3 px-2 text-gray-700">
                      {admin.username}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getRoleColor(admin.role)}`}>
                        {getRoleText(admin.role)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-500 text-sm">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Admin"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(admin)}
                          disabled={deletingId === admin.id}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Admin"
                        >
                          {deletingId === admin.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
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

      {/* Create Admin Modal */}
      <CreateAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Admin Modal */}
      <EditAdminModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmin(null);
        }}
        onSuccess={handleEditSuccess}
        admin={selectedAdmin}
      />
    </div>
  );
};

export default Admins;
