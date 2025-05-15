import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thoat } from "./authSlice";
import { showNotification } from "./components/NotificationContainer";
import Swal from "sweetalert2";
import "./admin_css/admin.css";

function AdminDashboard() {
    document.title = "Quản lý Dashboard";
    const user = useSelector(state => state.auth.user);
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalUsers: 0,
        orderStats: {
            total: 0,
            pending: 0,
            processing: 0,
            confirmed: 0,
            shipping: 0,
            delivered: 0,
            completed: 0,
            cancelled: 0
        },
        recentOrders: [],
        loading: true
    });

    useEffect(() => {
        if (!token) {
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: 'Vui lòng đăng nhập lại'
            });
            navigate('/login');
            return;
        }
        // Kiểm tra token
        console.log("Token:", token);

        const fetchStatistics = async () => {
            try {
                // Helper fetch function with error handling
                const fetchWithAuth = async (url) => {
                    const res = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!res.ok) {
                        let msg = "Không thể lấy dữ liệu";
                        try {
                            const err = await res.json();
                            msg = err.message || msg;
                            console.error("API error:", err);
                        } catch {}
                        throw new Error(msg);
                    }
                    return res.json();
                };

                const [products, categories, users, orders] = await Promise.all([
                    fetchWithAuth("http://localhost:3000/admin/sp"),
                    fetchWithAuth("http://localhost:3000/admin/category"),
                    fetchWithAuth("http://localhost:3000/admin/users"),
                    fetchWithAuth("http://localhost:3000/luudonhang")
                ]);

                // Calculate order statistics
                const orderStats = orders.reduce((acc, order) => {
                    acc.total++;
                    if (order.trang_thai in acc) acc[order.trang_thai]++;
                    return acc;
                }, {
                    total: 0,
                    pending: 0,
                    processing: 0,
                    confirmed: 0,
                    shipping: 0,
                    delivered: 0,
                    completed: 0,
                    cancelled: 0
                });

                // Sắp xếp đơn hàng mới nhất
                const recentOrders = orders
                    .sort((a, b) => new Date(b.thoi_diem_mua) - new Date(a.thoi_diem_mua))
                    .slice(0, 5);

                setStatistics({
                    totalProducts: products.length,
                    totalCategories: categories.length,
                    totalUsers: users.length,
                    orderStats,
                    recentOrders,
                    loading: false
                });
            } catch (error) {
                console.error("Error fetching statistics:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: error.message || 'Không thể lấy thống kê'
                });
                setStatistics(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStatistics();
    }, [token, navigate]);

    const Logout = async () => {
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
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-user-info">
                        <img src={user && user.hinh ? user.hinh : '/default-avatar.png'} alt={user && user.name ? user.name : 'Admin'} className="admin-user-avatar" />
                        <h3>{user && user.name ? user.name : 'Admin'}</h3>
                    </div>
                    <hr />
                </div>
                <nav className="admin-nav">
                    <ul>
                        <li>
                            <Link to="/admin" className="active">
                                <i className="fa-solid fa-layer-group"></i>
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/category">
                                <i className="bi bi-list-task"></i>
                                <span>Quản lý Danh mục</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/product">
                                <i className="fa-solid fa-tags"></i>
                                <span>Quản lý Sản phẩm</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/user">
                                <i className="fa-solid fa-user"></i>
                                <span>Quản lý Tài khoản</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/order">
                                <i className="fa-solid fa-shopping-cart"></i>
                                <span>Quản lý Đơn hàng</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
                <button onClick={Logout} className="logout-button">
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Đăng xuất</span>
                </button>
            </aside>

            <main className="admin-main">
                <div className="admin-header">
                    <h1>Dashboard</h1>
                    <div className="breadcrumb">
                        <Link to="/admin">
                            <i className="bi bi-house-door-fill"></i>
                        </Link>
                    </div>
                </div>

                {statistics.loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Đang tải thông tin...</p>
                    </div>
                ) : (
                    <>
                        <div className="stats-grid">
                            <div className="stat-card products">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-tags"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.totalProducts}</h3>
                                    <p>Sản phẩm</p>
                                </div>
                            </div>

                            <div className="stat-card categories">
                                <div className="stat-icon">
                                    <i className="bi bi-list-task"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.totalCategories}</h3>
                                    <p>Danh mục</p>
                                </div>
                            </div>

                            <div className="stat-card users">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-user"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.totalUsers}</h3>
                                    <p>Người dùng</p>
                                </div>
                            </div>

                            <div className="stat-card orders">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-shopping-cart"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.total}</h3>
                                    <p>Đơn hàng</p>
                                </div>
                            </div>
                        </div>

                        <div className="order-stats">
                            <div className="stat-card pending">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-clock"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.pending}</h3>
                                    <p>Chờ xác nhận</p>
                                </div>
                            </div>
                            <div className="stat-card confirmed">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-user-check"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.confirmed}</h3>
                                    <p>Đã xác nhận</p>
                                </div>
                            </div>
                            <div className="stat-card processing">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-spinner"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.processing}</h3>
                                    <p>Đang xử lý</p>
                                </div>
                            </div>
                            <div className="stat-card shipping">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-truck"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.shipping}</h3>
                                    <p>Đang vận chuyển</p>
                                </div>
                            </div>
                            <div className="stat-card delivered">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-box"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.delivered}</h3>
                                    <p>Đã giao hàng</p>
                                </div>
                            </div>
                            <div className="stat-card completed">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-check"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.completed}</h3>
                                    <p>Hoàn thành</p>
                                </div>
                            </div>
                            <div className="stat-card cancelled">
                                <div className="stat-icon">
                                    <i className="fa-solid fa-times"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{statistics.orderStats.cancelled}</h3>
                                    <p>Đã hủy</p>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-content">
                            <div className="recent-orders">
                                <h2>Đơn hàng gần đây</h2>
                                <div className="orders-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Mã đơn</th>
                                                <th>Khách hàng</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày đặt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statistics.recentOrders.map(order => (
                                                <tr key={order.id_dh}>
                                                    <td>#{order.id_dh}</td>
                                                    <td>{order.ho_ten}</td>
                                                    <td>{Number(order.tongtien).toLocaleString('vi-VN')}đ</td>
                                                    <td>
                                                        <span className={`status ${order.trang_thai}`}>
                                                            {order.trang_thai === 'pending' ? 'Chờ xác nhận' :
                                                             order.trang_thai === 'confirmed' ? 'Đã xác nhận' :
                                                             order.trang_thai === 'processing' ? 'Đang xử lý' :
                                                             order.trang_thai === 'shipping' ? 'Đang vận chuyển' :
                                                             order.trang_thai === 'delivered' ? 'Đã giao hàng' :
                                                             order.trang_thai === 'completed' ? 'Hoàn thành' :
                                                             'Đã hủy'}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(order.thoi_diem_mua).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;