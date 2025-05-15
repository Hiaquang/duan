import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { deleteCartItem as removeFromCart, fetchCart, updateCartItem, clearCart } from './redux/cartActions';
import './showCart.css';
import logo from './img/logo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ConfirmClearCartModal from './ConfirmClearCartModal';
import { themSP, xoaSP, xoaGH } from './cartSlice';

function ShowCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { listSP, loading, error } = useSelector(state => state.cart);
  const user = useSelector(state => state.auth.user);
  const token = localStorage.getItem('token');
  const [message, setMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  useEffect(() => {
    console.log("Dữ liệu giỏ hàng chi tiết:", listSP);
  }, [listSP]);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart(user.id));
  }, [dispatch, user, token, navigate]);

  useEffect(() => {
    if (listSP) {
      // Xử lý dữ liệu từ server để loại bỏ trùng lặp
      const uniqueItems = listSP.reduce((acc, currentItem) => {
        // Ensure we have the correct id_sp
        const itemId = currentItem.id_sp;
        const existingItem = acc.find(item => item.id_sp === itemId);
        if (existingItem) {
          // Nếu sản phẩm đã tồn tại, cộng dồn số lượng
          const newQuantity = Math.min(Number(existingItem.so_luong) + Number(currentItem.so_luong), 10);
          existingItem.so_luong = newQuantity;
          
          // Cập nhật số lượng trên server
          dispatch(updateCartItem({
            userId: user.id,
            productId: itemId,
            quantity: newQuantity,
            price: existingItem.gia,
            discountPrice: existingItem.gia_km
          }));
        } else {
          // Make sure we store id_sp correctly
          acc.push({
            ...currentItem,
            id_sp: itemId
          });
        }
        return acc;
      }, []);

      setCartItems(uniqueItems);
      const initialSelected = uniqueItems.reduce((acc, item) => {
        acc[item.id_sp] = false;
        return acc;
      }, {});
      setSelectedItems(initialSelected);
      calculateAndSetTotal([]);
    }
  }, [listSP, dispatch, user.id]);

  const calculateAndSetTotal = (items) => {
    // Kiểm tra nếu items là rỗng
    if (!items || items.length === 0) {
      setTotalPrice(0);
      return;
    }

    console.log("Đang tính tổng tiền cho các sản phẩm:", items);
    
    // Tính tổng tiền từ các sản phẩm được chọn
    const total = items.reduce((sum, item) => {
      // Lấy giá phù hợp (gia_km nếu có, không thì lấy gia)
      const price = item.gia_km && parseFloat(item.gia_km) > 0 
        ? parseFloat(item.gia_km) 
        : parseFloat(item.gia || 0);
      
      // Đảm bảo số lượng là số
      const quantity = parseInt(item.so_luong) || 1;
      
      const itemTotal = price * quantity;
      console.log(`Sản phẩm ${item.ten_sp}: Giá = ${price}, SL = ${quantity}, Thành tiền = ${itemTotal}`);
      
      return sum + itemTotal;
    }, 0);
    
    console.log("Tổng tiền sau khi tính toán:", total);
    setTotalPrice(total);
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev, [productId]: !prev[productId] };
      
      // Tính toán lại tổng tiền dựa trên các sản phẩm được chọn
      const selectedProducts = cartItems.filter(item => newSelected[item.id_sp]);
      calculateAndSetTotal(selectedProducts);
      
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedItems).every(Boolean);
    const newSelected = cartItems.reduce((acc, item) => {
      acc[item.id_sp] = !allSelected;
      return acc;
    }, {});
    setSelectedItems(newSelected);

    // Tính toán lại tổng tiền
    const selectedProducts = allSelected ? [] : cartItems;
    calculateAndSetTotal(selectedProducts);
  };

  const handleQuantityChange = async (productId, newQuantity, price, discountPrice) => {
    try {
      // Xác thực đầu vào
      const parsedQuantity = Number(newQuantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 10) {
        alert('Số lượng phải từ 1 đến 10 sản phẩm');
        return;
      }

      // Cập nhật giỏ hàng trên local state trước để UI cập nhật ngay
      setCartItems(prevItems => {
        const updatedItems = prevItems.map(item =>
          String(item.id_sp) === String(productId)
            ? { ...item, so_luong: parsedQuantity }
            : item
        );
        
        // Tính lại tổng tiền với số lượng mới
        calculateAndSetTotal(updatedItems.filter(item => selectedItems[item.id_sp]));
        
        return updatedItems;
      });

      // Lấy userId từ localStorage thay vì từ user object để đảm bảo luôn có giá trị
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Vui lòng đăng nhập để cập nhật giỏ hàng');
      }

      // Đảm bảo price là số
      const actualPrice = Number(price) || 0;
      const actualDiscountPrice = Number(discountPrice) || actualPrice;

      // Thực hiện cập nhật trên server
      await fetch(`http://localhost:3000/cart/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          productId: parseInt(productId),
          quantity: parsedQuantity
        })
      });

      // Sau khi cập nhật thành công, cập nhật lại Redux store
      dispatch(fetchCart(userId));
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Không thể cập nhật giỏ hàng: ' + error.message);
    }
  };
  const handleRemoveItem = (productId) => {
    if (window.confirm('Bạn muốn xóa sản phẩm này?')) {
      dispatch(xoaSP(productId));
    }
  };
  
  const confirmDelete = async () => {
    try {
      const productId = deleteProductId;
      // Gọi API xóa sản phẩm khỏi giỏ hàng với đường dẫn /cart/
      await fetch(`http://localhost:3000/cart/${user.id}/${productId}`, {
        method: 'DELETE',
      });
      setCartItems(prevItems => prevItems.filter(item => String(item.id_sp) !== String(productId)));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng!');
      setSelectedItems(prev => {
        const newSelected = { ...prev };
        delete newSelected[productId];
        return newSelected;
      });
      const selectedProducts = cartItems
        .filter(item => String(item.id_sp) !== String(productId))
        .filter(item => selectedItems[item.id_sp]);
      calculateAndSetTotal(selectedProducts);
      dispatch(fetchCart(user.id));
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa sản phẩm');
      dispatch(fetchCart(user.id));
    } finally {
      setShowDeleteModal(false);
      setDeleteProductId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteProductId(null);
  };

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      dispatch(xoaGH());
    }
  };

  const confirmClearCart = async () => {
    try {
      // Gọi API xóa toàn bộ giỏ hàng với đường dẫn /cart/
      await fetch(`http://localhost:3000/cart/${user.id}`, {
        method: 'DELETE',
      });
      setCartItems([]);
      setSelectedItems({});
      setTotalPrice(0);
      toast.success('Đã xóa toàn bộ giỏ hàng');
      setTimeout(() => {
        dispatch(fetchCart(user.id));
      }, 500);
    } catch (error) {
      toast.error('Lỗi khi xóa giỏ hàng');
      dispatch(fetchCart(user.id));
    } finally {
      setShowClearCartModal(false);
    }
  };

  const cancelClearCart = () => {
    setShowClearCartModal(false);
  };

  const handleCheckout = () => {
    if (totalPrice === 0) {
      setMessage('Vui lòng chọn sản phẩm để thanh toán');
      return;
    }

    // Lọc ra các sản phẩm đã chọn
    const selectedProducts = cartItems.filter(item => selectedItems[item.id_sp]);
    if (selectedProducts.length === 0) {
      setMessage('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    // Cập nhật giỏ hàng trong Redux store chỉ với các sản phẩm đã chọn
    dispatch({ 
      type: 'cart/updateCartCount', 
      payload: selectedProducts 
    });

    // Chuyển hướng đến trang thanh toán
    navigate('/thanh-toan');
  };

  const handleAddToCart = async (product) => {
    // Xóa toàn bộ giỏ hàng trước
    await fetch(`http://localhost:3000/cart/${user.id}`, { method: 'DELETE' });
    // Sau đó mới gọi API thêm sản phẩm vào giỏ hàng
    await fetch(`http://localhost:3000/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_user: user.id,
        id_sp: product.id,
        so_luong: 1,
        gia: product.gia,
        gia_km: product.gia_km
      })
    });

    // Cập nhật lại giao diện giỏ hàng
    dispatch(fetchCart(user.id));
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <img src={logo} alt="Logo" className="logo" />
        <h1>Giỏ Hàng Của Bạn</h1>
      </div>
      {message && <div className="message">{message}</div>}
      {(!cartItems || cartItems.length === 0) ? (
        <div className="empty-cart">
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to="/" className="continue-shopping">Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            <div className="select-all">
              <label>
                <input
                  type="checkbox"
                  checked={Object.values(selectedItems).every(Boolean)}
                  onChange={handleSelectAll}
                />
                Chọn tất cả
              </label>
            </div>
            {cartItems.map((item) => (
              <div key={item.id_sp} className="cart-item">
                <div className="item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems[item.id_sp] || false}
                    onChange={() => handleSelectItem(item.id_sp)}
                  />
                </div>
                <div className="item-image">
                  {item.hinh && <img src={item.hinh} alt={item.ten_sp} />}
                </div>
                <div className="item-details">
                  <h3>{item.ten_sp}</h3>
                  <div className="price">
                    {item.gia_km ? (
                      <>
                        <span className="original-price">{Number(item.gia).toLocaleString()}đ</span>
                        <span className="discount-price">{Number(item.gia_km).toLocaleString()}đ</span>
                      </>
                    ) : (
                      <span>{Number(item.gia).toLocaleString()}đ</span>
                    )}
                  </div>
                  <div className="quantity-control">
                    <button 
                      onClick={() => {
                        if (!item || !item.id_sp) {
                          console.error('Invalid item or item ID:', item);
                          return;
                        }
                        const currentQuantity = Number(item.so_luong);
                        if (currentQuantity > 1) {
                          handleQuantityChange(
                            item.id_sp, 
                            currentQuantity - 1,
                            item.gia,
                            item.gia_km
                          );
                        }
                      }}
                      disabled={Number(item.so_luong) <= 1}
                    >
                      -
                    </button>
                    <span>{item.so_luong}</span>
                    <button 
                      onClick={() => {
                        if (!item || !item.id_sp) {
                          console.error('Invalid item or item ID:', item);
                          return;
                        }
                        const currentQuantity = Number(item.so_luong);
                        if (currentQuantity < 10) {
                          handleQuantityChange(
                            item.id_sp,
                            currentQuantity + 1,
                            item.gia,
                            item.gia_km
                          );
                        }
                      }}
                      disabled={Number(item.so_luong) >= 10}
                    >
                      +
                    </button>
                  </div>
                  <button className="remove-item" onClick={() => handleRemoveItem(item.id_sp)}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <div className="total">
              <h3>Tổng tiền:</h3>
              <span>{totalPrice.toLocaleString()}đ</span>
            </div>
            <div className="cart-actions">
              <button className="clear-cart" onClick={handleClearCart}>
                Xóa giỏ hàng
              </button>
              <button 
                className={`checkout-btn ${totalPrice === 0 ? 'disabled' : ''}`}
                onClick={handleCheckout}
                disabled={totalPrice === 0}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </>
      )}
      <ConfirmDeleteModal
        open={showDeleteModal}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <ConfirmClearCartModal
        open={showClearCartModal}
        onConfirm={confirmClearCart}
        onCancel={cancelClearCart}
      />
      <ToastContainer />
    </div>
  );
}

export default ShowCart;