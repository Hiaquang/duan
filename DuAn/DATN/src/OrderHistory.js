import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
// import './OrderHistory.css';
import '../public/css/user/OrderHistory.css'

// Cập nhật ánh xạ trạng thái đơn hàng để hiển thị đúng
const OrderStatus = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang vận chuyển',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  completed: 'Hoàn thành',
  // Đảm bảo các trạng thái từ backend được xử lý đúng
  'Chờ xác nhận': 'Chờ xác nhận',
  'Đã xác nhận': 'Đã xác nhận',
  'Đang xử lý': 'Đang xử lý',
  'Đang vận chuyển': 'Đang vận chuyển',
  'Đã giao hàng': 'Đã giao hàng', 
  'Đã hủy': 'Đã hủy',
  'Hoàn thành': 'Hoàn thành'
};

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false); 
  const user = useSelector(state => state.user.currentUser);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Bạn cần đăng nhập để xem lịch sử đơn hàng");
          setLoading(false);
          return;
        }

        if (!user || !user.id) {
          setError("Không thể xác định người dùng hiện tại");
          setLoading(false);
          return;
        }

        // Cập nhật đúng port và thêm timestamp để tránh cache
        const response = await axios.get(`http://localhost:3001/orders/user/${user.id}?_=${new Date().getTime()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-cache'
        });
        
        // Xử lý dữ liệu trả về để đảm bảo trạng thái hiển thị chính xác
        const processedOrders = response.data.map(order => ({
          ...order,
          // Đảm bảo trạng thái được xử lý đúng
          display_status: OrderStatus[order.trang_thai] || 'Chờ xác nhận'
        }));
        
        setOrders(processedOrders);
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", err);
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refresh, user]);

  const handleRefresh = () => {
    setLoading(true);
    setRefresh(prev => !prev);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Bạn cần đăng nhập để hủy đơn hàng");
        return;
      }

      // Cập nhật port từ 3000 thành 3001
      const response = await axios.put(`http://localhost:3001/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Cập nhật lại danh sách đơn hàng sau khi hủy thành công
      setOrders(orders.map(order => 
        order.id_dh === orderId 
          ? {...order, trang_thai: 'cancelled', display_status: 'Đã hủy'} 
          : order
      ));
      
      alert("Đơn hàng đã được hủy thành công");
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      alert(err.response?.data?.error || "Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  if (loading) {
    return <div className="loading">Đang tải lịch sử đơn hàng...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="order-history-container">
        <h2>Lịch sử đơn hàng</h2>
        <div className="no-orders">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="shop-now-btn">Mua sắm ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h2>Lịch sử đơn hàng</h2>
      
      <button className="refresh-btn" onClick={handleRefresh}>
        Làm mới
      </button>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id_dh} className="order-card">
            <div className="order-header">
              <div className="order-id">
                Đơn hàng #{order.id_dh}
              </div>
              <div className={`order-status status-${order.trang_thai || 'pending'}`}>
                {/* Sử dụng display_status để hiển thị trạng thái chính xác */}
                {order.display_status}
              </div>
            </div>
            
            <div className="order-details">
              <div className="order-info">
                <p><strong>Ngày đặt:</strong> {formatDate(order.thoi_diem_mua)}</p>
                <p><strong>Người nhận:</strong> {order.ho_ten}</p>
                <p><strong>Địa chỉ:</strong> {order.address}</p>
                <p><strong>Số điện thoại:</strong> {order.sdt}</p>
              </div>
              
              <div className="order-total">
                <p><strong>Tổng tiền:</strong> {formatPrice(order.tongtien)}</p>
                
                {(order.trang_thai === 'pending' || !order.trang_thai) && (
                  <button 
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order.id_dh)}
                  >
                    Hủy đơn hàng
                  </button>
                )}
                
                <Link to={`/order-detail/${order.id_dh}`} className="view-detail-btn">
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistory;