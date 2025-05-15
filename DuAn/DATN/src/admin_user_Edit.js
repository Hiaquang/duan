import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { showNotification } from './components/NotificationContainer';
import './admin_css/admin_user.css';

function AdminUserEdit({ user, setRefresh, onClose }) {
    const { token } = useSelector((state) => state.auth);
    const [editedUser, setEditedUser] = useState({
        name: user?.name || "",
        email: user?.email || "",
        dia_chi: user?.dia_chi || "",
        dien_thoai: user?.dien_thoai || "",
        role: user?.role || 0
    });

    useEffect(() => {
        if (user) {
            setEditedUser({
                name: user.name || "",
                email: user.email || "",
                dia_chi: user.dia_chi || "",
                dien_thoai: user.dien_thoai || "",
                role: user.role || 0
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: name === 'role' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedUser)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi cập nhật thông tin người dùng');
            }

            showNotification({ 
                type: 'success', 
                title: 'Thành công', 
                message: 'Cập nhật thông tin người dùng thành công'
            });
            
            setRefresh(prev => !prev);
            
            // Đóng modal
            const modal = document.getElementById('editUserModal');
            const bsModal = window.bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
            
            if (onClose) onClose();

        } catch (error) {
            showNotification({ 
                type: 'error', 
                title: 'Lỗi', 
                message: error.message 
            });
        }
    };

    return (
        <div className="modal fade" id="editUserModal" tabIndex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="editUserModalLabel">Chỉnh sửa thông tin người dùng</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Tên</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={editedUser.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    value={editedUser.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Địa chỉ</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="dia_chi"
                                    value={editedUser.dia_chi}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Điện thoại</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="dien_thoai"
                                    value={editedUser.dien_thoai}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Vai trò</label>
                                <select
                                    className="form-select"
                                    name="role"
                                    value={editedUser.role}
                                    onChange={handleChange}
                                >
                                    <option value={0}>User</option>
                                    <option value={1}>Admin</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminUserEdit;