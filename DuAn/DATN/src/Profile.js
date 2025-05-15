import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
// import "./Profile.css";
import "../src/public/css/user/Profile copy.css";
import { thoat } from "./authSlice";
import { setUser } from "./userSlice";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmLogoutModal from "./ConfirmLogoutModal";

function Profile() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setLocalUser] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State cho lịch sử đơn hàng
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // State for reviews
  const [userReviews, setUserReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError("Lỗi: Không tìm thấy userId từ URL!");
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      dispatch(thoat());
      navigate("/auth");
      setIsLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        console.log("Fetching profile for userId:", userId); // Debug
        const response = await fetch(`http://localhost:3000/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("Response status:", response.status); // Debug
        if (response.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          dispatch(thoat());
          navigate("/auth");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          const errorText = await response.text(); // Lấy thông báo lỗi từ server
          throw new Error(`Lỗi: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("Data received:", data); // Debug
        setLocalUser(data);
        setEditedUser(data);
        dispatch(setUser(data));
        setPreviewUrl(data.hinh ? `http://localhost:3000/uploads/${data.hinh}` : null);
      } catch (err) {
        console.error("Lỗi fetch:", err.message);
        setError(err.message);
      } finally {
        setIsLoading(false); // Đảm bảo kết thúc trạng thái tải
      }
    };

    fetchUserProfile();
  }, [userId, dispatch, navigate]);

  // Lấy lịch sử đơn hàng
  const fetchOrderHistory = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      const response = await fetch(`http://localhost:3000/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(`Lỗi khi lấy lịch sử đơn hàng: ${err.message}`);
      console.error("Lỗi lấy lịch sử đơn hàng:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Lấy chi tiết đơn hàng
  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      const response = await fetch(`http://localhost:3000/orders/user/${userId}/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setOrderDetails(data);
      setSelectedOrder(orderId);
    } catch (err) {
      setError(`Lỗi khi lấy chi tiết đơn hàng: ${err.message}`);
      console.error("Lỗi lấy chi tiết đơn hàng:", err);
    }
  };

  // Hủy đơn hàng
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      const response = await fetch(`http://localhost:3000/orders/user/${userId}/${orderId}/status`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trang_thai: "cancelled" })
      });

      if (response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lỗi: ${response.status} - ${errorText}`);
      }

      setSuccessMessage("Đã hủy đơn hàng thành công");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Cập nhật lại danh sách đơn hàng sau khi hủy
      fetchOrderHistory();

      // Cập nhật chi tiết đơn hàng nếu đang xem
      if (selectedOrder === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (err) {
      setError(`Không thể hủy đơn hàng: ${err.message}`);
      console.error("Lỗi hủy đơn hàng:", err);
    }
  };

  // Fetch user's previous reviews
  const fetchUserReviews = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews/user/${user._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setUserReviews(response.data.reviews);
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      toast.error('Error loading reviews. Please try again.');
    }
  }, [user]);

  // Submit a product review
  const submitReview = async (e) => {
    e.preventDefault();
    
    if (!currentProductId || reviewRating < 1) {
      toast.error('Please provide a rating');
      return;
    }
    
    try {
      const reviewData = {
        product_id: currentProductId,
        rating: reviewRating,
        comment: reviewComment
      };
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/reviews`,
        reviewData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      if (response.data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        fetchUserReviews();
      } else {
        toast.error(response.data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review. Please try again.');
    }
  };

  // Open review modal for a specific product
  const openReviewModal = (productId, productName) => {
    setCurrentProductId(productId);
    setShowReviewModal(true);
  };

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchUserReviews();
    }
  }, [activeTab, userId, fetchUserReviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      const response = await fetch(`http://localhost:3000/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editedUser),
      });

      if (response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cập nhật thất bại: ${errorText}`);
      }

      const updatedUser = await response.json();
      setLocalUser(updatedUser);
      dispatch(setUser(updatedUser));
      setSuccessMessage("Cập nhật thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      console.error("Lỗi update:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vui lòng chọn ảnh trước khi tải lên!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      dispatch(thoat());
      navigate("/auth");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      const response = await fetch(`http://localhost:3000/profile/${userId}/upload-avatar`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        dispatch(thoat());
        navigate("/auth");
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload ảnh thất bại: ${errorText}`);
      }

      const updatedUser = await response.json();
      setLocalUser(updatedUser);
      dispatch(setUser(updatedUser));
      setPreviewUrl(`http://localhost:3000/uploads/${updatedUser.hinh}`);
      setSelectedFile(null);
      setSuccessMessage("Upload ảnh thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
      console.error("Lỗi upload:", err);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    dispatch(thoat());
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // Xử lý chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'orders') {
      fetchOrderHistory();
    }
    // Reset selected order khi chuyển tab
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Hiển thị tên trạng thái (đồng bộ với admin)
  const getOrderStatusName = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang vận chuyển';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return 'Chờ xác nhận';
    }
  };

  if (isLoading) return <p>Đang tải thông tin...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!user) return <p>Không có dữ liệu người dùng</p>;

  return (
    <div className="profile-container">
      <div className="profile-left">
        {activeTab === 'profile' && (
          <>
            <div className="profile-header">Thông tin tài khoản</div>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Tên đăng nhập</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Họ và tên</span>
                <span className="info-value">{user.name}</span>
              </div>
            </div>   
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
            
            <div className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input type="text" id="name" name="name" value={editedUser.name || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Điện thoại</label>
                <input type="text" id="phone" name="dien_thoai" value={editedUser.dien_thoai || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={editedUser.email || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="dia_chi">Địa chỉ</label>
                <input type="text" id="dia_chi" name="dia_chi" value={editedUser.dia_chi || ''} onChange={handleChange} />
              </div>
              <button className="update-button" onClick={handleUpdate}>CẬP NHẬT THÔNG TIN</button>
            </div>

            <div className="profile-header">Cập nhật ảnh đại diện</div>
            <div className="profile-avatar-upload">
              <label htmlFor="avatar-upload" className="upload-label">Chọn ảnh</label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button className="upload-button" onClick={handleUpload}>Tải ảnh lên</button>
              {selectedFile ? (
                <span>{selectedFile.name}</span>
              ) : (
                <span>Không có tập nào được chọn</span>
              )}
              {previewUrl && (
                <img src={previewUrl} alt="Avatar" width="150" />
              )}
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="profile-header">Lịch sử đơn hàng</div>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
            
            {loadingOrders ? (
              <p>Đang tải lịch sử đơn hàng...</p>
            ) : (
              <>
                {selectedOrder && orderDetails ? (
                  <div className="order-details">
                    <div className="order-detail-header">
                      <h3>Chi tiết đơn hàng #{orderDetails.order.id_dh}</h3>
                      <button className="back-button" onClick={() => { setSelectedOrder(null); setOrderDetails(null); }}>
                        Quay lại danh sách
                      </button>
                    </div>

                    <div className="order-info">
                      <div className="info-row">
                        <span className="info-label">Ngày đặt:</span>
                        <span className="info-value">{new Date(orderDetails.order.thoi_diem_mua).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Trạng thái:</span>
                        <span className={`order-status ${orderDetails.order.trang_thai || 'pending'}`}>
                          {getOrderStatusName(orderDetails.order.trang_thai)}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Tổng tiền:</span>
                        <span className="info-value">{formatCurrency(orderDetails.order.tongtien)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Địa chỉ:</span>
                        <span className="info-value">{orderDetails.order.address || 'Không có'}</span>
                      </div>
                    </div>

                    <h4>Sản phẩm trong đơn hàng</h4>
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th>Hình ảnh</th>
                          <th>Tên sản phẩm</th>
                          <th>Số lượng</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.details.map((item) => (
                          <tr key={item.id_ct}>
                            <td>
                              <img src={item.hinh} alt={item.ten_sp} className="product-thumbnail" />
                            </td>
                            <td>{item.ten_sp}</td>
                            <td>{item.so_luong}</td>
                            <td>{formatCurrency(item.gia_km || item.gia)}</td>
                            <td>{formatCurrency((item.gia_km || item.gia) * item.so_luong)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {orderDetails.order.trang_thai !== 'completed' && orderDetails.order.trang_thai !== 'cancelled' && (
                      <div className="order-actions">
                        <button className="cancel-order-btn" onClick={() => cancelOrder(orderDetails.order.id_dh)}>
                          Hủy đơn hàng
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {orders.length === 0 ? (
                      <p className="no-orders">Bạn chưa có đơn hàng nào</p>
                    ) : (
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>Mã đơn hàng</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id_dh}>
                              <td>#{order.id_dh}</td>
                              <td>{new Date(order.thoi_diem_mua).toLocaleDateString('vi-VN')}</td>
                              <td>{formatCurrency(order.tongtien)}</td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                              <span className={`order-status ${order.trang_thai || 'pending'}`}>
                                  {getOrderStatusName(order.trang_thai)}
                                </span>
                              </td>
                              <td className="order-actions">
                                <button className="view-detail-btn" onClick={() => fetchOrderDetails(order.id_dh)}>
                                  Xem chi tiết
                                </button>
                                {(order.trang_thai === 'pending' || order.trang_thai === 'processing') && (
                                  <button className="cancel-btn" onClick={() => cancelOrder(order.id_dh)}>
                                    Hủy đơn
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <h3>My Product Reviews</h3>
            
            {userReviews.length === 0 ? (
              <p>You haven't submitted any reviews yet.</p>
            ) : (
              <div className="reviews-list">
                {userReviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <h4>{review.product_name}</h4>
                      <div className="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                        ))}
                      </div>
                      <p className="review-date">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-actions">
                      <button className="btn-edit-review" onClick={() => {
                        setCurrentProductId(review.product_id);
                        setReviewRating(review.rating);
                        setReviewComment(review.comment);
                        setShowReviewModal(true);
                      }}>Edit Review</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showReviewModal && (
          <div className="review-modal-overlay">
            <div className="review-modal">
              <h3>Write a Review</h3>
              <form onSubmit={submitReview}>
                <div className="rating-selector">
                  <p>Rating:</p>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={i < reviewRating ? 'star filled' : 'star'} 
                        onClick={() => setReviewRating(i + 1)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reviewComment">Your Review:</label>
                  <textarea
                    id="reviewComment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows="4"
                    required
                  />
                </div>

                <div className="modal-buttons">
                  <button type="button" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="profile-right">
        <div className="profile-card">
          <img src={previewUrl || `http://localhost:3000/uploads/${user.hinh}`} alt="" width="150" />
          <h2>{user.name}</h2>
        </div>
        <ul className="profile-menu">
          <li 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => handleTabChange('profile')}
          >
            Thông tin tài khoản
          </li>
          <li 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => handleTabChange('orders')}
          >
            Lịch sử đơn hàng
          </li>
          <li 
            className={activeTab === 'reviews' ? 'active' : ''} 
            onClick={() => handleTabChange('reviews')}
          >
            My Reviews
          </li>
          <li>Lịch sử giao dịch</li>
          <li>Mật khẩu và bảo mật</li>
          <li>Bình luận của tôi</li>
          <li>Sản phẩm yêu thích</li>
          <li>
            <button className="logout" onClick={handleLogout}>Đăng xuất</button>
          </li>
        </ul>
      </div>
      <ConfirmLogoutModal 
        open={showLogoutModal} 
        onConfirm={confirmLogout} 
        onCancel={cancelLogout} 
      />
    </div>
  );
}

export default Profile;