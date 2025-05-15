import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { thoat } from "../authSlice";
import { showNotification } from "./NotificationContainer";
import Swal from "sweetalert2";
import './AdminSidebar.css';

function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const username = useSelector(state => state.auth.user?.name || "Admin");

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Đăng xuất?',
            text: "Bạn có chắc chắn muốn đăng xuất?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        });
        if (result.isConfirmed) {
            dispatch(thoat());
            showNotification({
                type: 'success',
                title: 'Thành công',
                message: 'Đăng xuất thành công'
            });
            navigate('/auth');
        }
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <img src="/logo.png" alt="Logo" className="sidebar-logo" />
                <div className="sidebar-username">{username}</div>
                <hr style={{ width: "60%", borderColor: "#ffffff33", margin: "1rem 0" }} />
            </div>
            <ul className="sidebar-menu">
                <li className={location.pathname === "/admin" ? "active" : ""}>
                    <Link to="/admin"><i className="bi bi-stack"></i> Dashboard</Link>
                </li>
                <li className={location.pathname.startsWith("/admin/category") ? "active" : ""}>
                    <Link to="/admin/category"><i className="bi bi-list-ul"></i> Quản lý Danh mục</Link>
                </li>
                <li className={location.pathname.startsWith("/admin/product") ? "active" : ""}>
                    <Link to="/admin/product"><i className="bi bi-tag"></i> Quản lý Sản phẩm</Link>
                </li>
                <li className={location.pathname.startsWith("/admin/user") ? "active" : ""}>
                    <Link to="/admin/user"><i className="bi bi-person"></i> Quản lý Tài khoản</Link>
                </li>
                <li className={location.pathname.startsWith("/admin/order") ? "active" : ""}>
                    <Link to="/admin/order"><i className="bi bi-cart"></i> Quản lý Đơn hàng</Link>
                </li>
            </ul>
            <button className="sidebar-logout" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Đăng xuất
            </button>
        </aside>
    );
}

export default AdminSidebar;
