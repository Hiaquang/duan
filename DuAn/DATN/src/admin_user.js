import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminUserEdit from './admin_user_Edit';
import './admin_css/admin_common.css';
import './admin_css/admin_user.css';
import { showNotification } from './components/NotificationContainer';
import AdminSidebar from './components/AdminSidebar';

function AdminUser() {
    document.title = "Quản lý tài khoản";
    const [adminListUS, setAdminListUS] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("http://localhost:3000/admin/users", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    let msg = `Không thể lấy danh sách người dùng (HTTP ${response.status})`;
                    let backendMsg = "";
                    try {
                        const err = await response.json();
                        backendMsg = err.message || JSON.stringify(err);
                        msg += `\nChi tiết: ${backendMsg}`;
                        console.error("API error (JSON):", err);
                    } catch (e) {
                        const text = await response.text();
                        backendMsg = text;
                        msg += `\nChi tiết: ${text}`;
                        console.error("API error (not JSON):", text);
                    }
                    alert(msg);
                    throw new Error(msg);
                }
                const data = await response.json();
                setAdminListUS(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: error.message || 'Không thể lấy danh sách người dùng'
                });
            }
        };
        fetchUsers();
    }, [refresh, token]);

    const xoaUS = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
            try {
                const response = await fetch(`http://localhost:3000/admin/users/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: "Lỗi khi xóa người dùng" }));
                    throw new Error(errorData.message || "Lỗi khi xóa người dùng");
                }
                showNotification({ type: 'success', title: 'Thành công', message: 'Xóa người dùng thành công' });
                setRefresh(!refresh);
            } catch (error) {
                console.error("Lỗi khi xóa người dùng:", error);
                showNotification({ type: 'error', title: 'Lỗi', message: error.message });
            }
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        const modalElement = document.getElementById('editUserModal');
        if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    // Lọc người dùng dựa trên tìm kiếm và filter
    const filteredUsers = adminListUS.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.dien_thoai?.includes(searchTerm);
        
        const matchesRole = roleFilter === "all" || 
                          (roleFilter === "admin" && user.role === 1) ||
                          (roleFilter === "user" && user.role === 0);
        
        return matchesSearch && matchesRole;
    });

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <AdminSidebar />
            <div style={{ marginLeft: 250, padding: '2rem 1rem' }}>
                <div className="admin_page_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Quản lý tài khoản</h1>
                    <Link to="/admin" style={{ fontSize: '1.5rem', color: '#333' }}>
                        <i className="bi bi-house-door-fill"></i>
                    </Link>
                </div>

                <div className="search-filter-container">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="filter-box">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="form-select"
                        >
                            <option value="all">Tất cả</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Địa chỉ</th>
                            <th>Điện thoại</th>
                            <th>Vai trò</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.dia_chi || '-'}</td>
                                <td>{user.dien_thoai || '-'}</td>
                                <td>{user.role === 1 ? 'Admin' : 'User'}</td>
                                <td>
                                    <button 
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => handleEdit(user)}
                                    >
                                        Sửa
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => xoaUS(user.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Phân trang */}
                <div className="pagination">
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                                className="pagination-button"
                            >
                                &laquo;
                            </button>
                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => paginate(pageNumber)}
                                        className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => paginate(totalPages)}
                                disabled={currentPage === totalPages}
                                className="pagination-button"
                            >
                                &raquo;
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal chỉnh sửa người dùng */}
                {selectedUser && (
                    <AdminUserEdit
                        user={selectedUser}
                        setRefresh={setRefresh}
                        onClose={() => setSelectedUser(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default AdminUser;