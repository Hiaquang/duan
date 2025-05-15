import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import './admin_css/admin_common.css';
import './admin_css/admin_order.css';
import { showNotification } from './components/NotificationContainer';
import AdminSidebar from './components/AdminSidebar';

function AdminOrder() {
    document.title = "Quản lý Đơn hàng";
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [refresh, setRefresh] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [isViewingDetails, setIsViewingDetails] = useState(false);
    const { token } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch("http://localhost:3000/luudonhang", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    let msg = `Không thể lấy danh sách đơn hàng (HTTP ${response.status})`;
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
                    alert(msg); // Hiển thị popup cho dễ thấy khi test
                    throw new Error(msg);
                }
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: error.message || 'Không thể lấy danh sách đơn hàng'
                });
            }
        };
        fetchOrders();
    }, [refresh, token]);

    // Fetch order details - sửa endpoint API
    const fetchOrderDetails = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/luudonhang/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error("Không thể lấy chi tiết đơn hàng");
            const data = await response.json();
            setOrderDetails(data);
            setIsViewingDetails(true);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể lấy chi tiết đơn hàng'
            });
        }
    };

    // Update order status
    const updateOrderStatus = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:3000/luudonhang/${id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ trang_thai: status })
            });

            if (!response.ok) {
                throw new Error("Lỗi khi cập nhật trạng thái đơn hàng");
            }

            showNotification({
                type: 'success',
                title: 'Thành công',
                message: 'Cập nhật trạng thái đơn hàng thành công'
            });
            setRefresh(!refresh);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: 'Không thể cập nhật trạng thái đơn hàng'
            });
        }
    };

    // Tính toán phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);

    const xoaOrder = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) {
            try {
                const response = await fetch(`http://localhost:3000/luudonhang/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error("Lỗi khi xóa đơn hàng");
                }

                showNotification({
                    type: 'success',
                    title: 'Thành công',
                    message: 'Xóa đơn hàng thành công'
                });
                setRefresh(!refresh);
            } catch (error) {
                console.error("Lỗi khi xóa đơn hàng:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: 'Không thể xóa đơn hàng'
                });
            }
        }
    };

    const getStatusName = (status) => {
        switch(status) {
            case 'pending': return 'Chờ xác nhận';
            case 'confirmed': return 'Đã xác nhận';
            case 'processing': return 'Đang xử lý';
            case 'shipping': return 'Đang vận chuyển';
            case 'delivered': return 'Đã giao hàng';
            case 'completed': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return 'Chờ xác nhận';
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div>
            <AdminSidebar />
            <div style={{ marginLeft: 250, padding: '2rem 1rem' }}>
                {isViewingDetails && orderDetails ? (
                    <div className="order-details-view">
                        <div className="admin_page_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h1>Chi tiết đơn hàng #{orderDetails.order.id_dh}</h1>
                            <button 
                                className="btn btn-secondary"
                                onClick={() => setIsViewingDetails(false)}
                            >
                                <i className="bi bi-arrow-left"></i> Quay lại
                            </button>
                        </div>

                        <div className="order-info">
                            <h3>Thông tin đơn hàng</h3>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Họ tên:</strong> {orderDetails.order.ho_ten}</p>
                                    <p><strong>Email:</strong> {orderDetails.order.email}</p>
                                    <p><strong>Số điện thoại:</strong> {orderDetails.order.sdt || 'Không có'}</p>
                                    <p><strong>Địa chỉ:</strong> {orderDetails.order.address || 'Không có'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Ngày đặt:</strong> {new Date(orderDetails.order.thoi_diem_mua).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p><strong>Tổng tiền:</strong> {formatCurrency(orderDetails.order.tongtien)}</p>
                                    <p>
                                        <strong>Trạng thái:</strong> 
                                        <select 
                                            className="form-control d-inline-block ml-2" 
                                            style={{width: "180px", marginLeft: "10px"}}
                                            value={orderDetails.order.trang_thai || 'pending'}
                                            onChange={(e) => updateOrderStatus(orderDetails.order.id_dh, e.target.value)}
                                        >
                                            <option value="pending">Chờ xác nhận</option>
                                            <option value="confirmed">Đã xác nhận</option>
                                            <option value="processing">Đang xử lý</option>
                                            <option value="shipping">Đang vận chuyển</option>
                                            <option value="delivered">Đã giao hàng</option>
                                            <option value="completed">Hoàn thành</option>
                                            <option value="cancelled">Đã hủy</option>
                                        </select>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h3>Sản phẩm trong đơn hàng</h3>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Hình ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Đơn giá</th>
                                    <th>Giá KM</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.details.map((item) => (
                                    <tr key={item.id_ct}>
                                        <td>
                                            <img src={item.hinh} alt={item.ten_sp} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                        </td>
                                        <td>{item.ten_sp}</td>
                                        <td>{item.so_luong}</td>
                                        <td>{formatCurrency(item.gia)}</td>
                                        <td>{formatCurrency(item.gia_km)}</td>
                                        <td>{formatCurrency((item.gia_km || item.gia) * item.so_luong)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" className="text-right"><strong>Tổng cộng:</strong></td>
                                    <td><strong>{formatCurrency(orderDetails.order.tongtien)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <>
                        <div className="admin_page_header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h1>Quản lý Đơn hàng</h1>
                            <Link to="/admin" style={{ fontSize: '1.5rem', color: '#333' }}>
                                <i className="bi bi-house-door-fill"></i>
                            </Link>
                        </div>

                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Họ tên</th>
                                    <th>Email</th>
                                    <th>Số điện thoại</th>
                                    <th>Địa chỉ</th>
                                    <th>Tổng tiền</th>
                                    <th>Ngày đặt</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((order) => (
                                    <tr key={order.id_dh}>
                                        <td>{order.id_dh}</td>
                                        <td>{order.ho_ten}</td>
                                        <td>{order.email}</td>
                                        <td>{order.sdt || 'N/A'}</td>
                                        <td>{order.address || 'N/A'}</td>
                                        <td>{formatCurrency(order.tongtien)}</td>
                                        <td>{new Date(order.thoi_diem_mua).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`status-badge ${order.trang_thai || 'pending'}`}>
                                                {getStatusName(order.trang_thai)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="btn-group">
                                                <button 
                                                    className="btn btn-info btn-sm mr-1"
                                                    onClick={() => fetchOrderDetails(order.id_dh)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => xoaOrder(order.id_dh)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Phân trang */}
                        <div className="pagination">
                            {[...Array(Math.ceil(orders.length / itemsPerPage))].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={currentPage === index + 1 ? "active" : ""}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminOrder;