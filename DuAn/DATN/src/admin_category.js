import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminCategoryEdit from './admin_category_Edit';
import AdminCategoryThem from './admin_category_Them';
import './admin_css/admin_category.css';
import './admin_css/admin_common.css';
import { showNotification } from './components/NotificationContainer';
import AdminSidebar from './components/AdminSidebar';

function AdminCategory() {
    document.title = "Quản lý Danh mục";
    const [categories, setCategories] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:3000/admin/category", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    let msg = `Không thể lấy danh sách danh mục (HTTP ${response.status})`;
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
                setCategories(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách danh mục:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: error.message || 'Không thể lấy danh sách danh mục'
                });
            }
        };
        fetchCategories();
    }, [refresh, token]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        const modalElement = document.getElementById('editModal');
        if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    const xoaDM = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
            try {
                const response = await fetch(`http://localhost:3000/admin/category/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Lỗi khi xóa danh mục");
                }

                showNotification({
                    type: 'success',
                    title: 'Thành công',
                    message: 'Xóa danh mục thành công'
                });
                setRefresh(!refresh);
            } catch (error) {
                console.error("Lỗi khi xóa danh mục:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: 'Không thể xóa danh mục'
                });
            }
        }
    };

    return (
        <div>
            <AdminSidebar />
            <div style={{ marginLeft: 250, padding: '2rem 1rem' }}>
                <div className="admin_page_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h1>Quản lý Danh mục</h1>
                    <Link to="/admin" style={{ fontSize: '1.5rem', color: '#333' }}>
                        <i className="bi bi-house-door-fill"></i>
                    </Link>
                </div>

                <button 
                    type="button" 
                    className="btn btn-primary mb-3"
                    data-bs-toggle="modal" 
                    data-bs-target="#addCategoryModal"
                >
                    Thêm danh mục mới
                </button>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Tên danh mục</th>
                            <th>Slug</th>
                            <th>Thứ tự</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>
                                    <img 
                                        src={category.img_loai} 
                                        alt={category.ten_loai} 
                                        style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                    />
                                </td>
                                <td>{category.ten_loai}</td>
                                <td>{category.slug}</td>
                                <td>{category.thu_tu}</td>
                                <td>{category.an_hien ? 'Hiện' : 'Ẩn'}</td>
                                <td>
                                    <button 
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => handleEdit(category)}
                                    >
                                        Sửa
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => xoaDM(category.id)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal thêm danh mục */}
                <div className="modal fade" id="addCategoryModal" tabIndex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="addCategoryModalLabel">Thêm Danh Mục</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <AdminCategoryThem setRefresh={setRefresh} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal sửa danh mục */}
                {selectedCategory && (
                    <AdminCategoryEdit
                        loai={selectedCategory}
                        setRefresh={setRefresh}
                    />
                )}
            </div>
        </div>
    );
}

export default AdminCategory;
