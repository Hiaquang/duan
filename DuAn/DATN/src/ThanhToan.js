import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { xoaGH } from "./cartSlice";
import { useNavigate } from "react-router-dom";
import "./ThanhToan.css";

function ThanhToan() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    dien_thoai: "",
    dia_chi: "",
  });
  
  // Lấy cart từ Redux store và force component re-render khi cart thay đổi
  const cart = useSelector((state) => state.cart.listSP, (prev, next) => 
    JSON.stringify(prev) === JSON.stringify(next)
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Log giỏ hàng mỗi khi thay đổi để debug
  console.log("Cart updated in ThanhToan:", cart);

  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // Tính toán lại giá mỗi khi cart thay đổi
  useEffect(() => {
    // Tính toán tổng tiền
    let amount = 0;
    let quantity = 0;
    
    cart.forEach(item => {
      // Lấy giá đúng (gia_km nếu có, không thì gia)
      const price = item.gia_km !== null && item.gia_km !== undefined && item.gia_km > 0 
        ? parseFloat(item.gia_km) 
        : parseFloat(item.gia || 0);
      
      // Đảm bảo số lượng là số
      const qty = parseInt(item.so_luong) || 1;
      
      amount += price * qty;
      quantity += qty;
    });
    
    console.log("Calculated new total:", amount, "from items:", cart);
    setTotalAmount(amount);
    setTotalQuantity(quantity);
  }, [cart]);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) {
      alert("Không tìm thấy userId hoặc token, vui lòng đăng nhập lại!");
      navigate("/login");
      return;
    }

    fetch(`http://localhost:3000/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Lỗi ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data.id) setUser(data);
        else alert("Không tìm thấy thông tin người dùng!");
      })
      .catch((error) => {
        console.error("Lỗi tải thông tin user:", error);
        alert("Có lỗi khi tải thông tin user, vui lòng thử lại!");
        navigate("/login");
      });
  }, [navigate]);
  const token = localStorage.getItem("token");
  const submitDuLieu = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      navigate("/login");
      return;
    }

    const userId = localStorage.getItem("userId");
    
    let url = "http://localhost:3000/luudonhang";

    // Lấy totalAmount từ state để đảm bảo dùng giá trị mới nhất
    let opt = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_user: parseInt(userId),
        ho_ten: user.name,
        email: user.email,
        sdt: user.dien_thoai,
        dia_chi: user.dia_chi,
        tong_tien: totalAmount, // Sử dụng giá trị mới nhất từ state
        hinh_thuc_tt: paymentMethod,
      }),
    };

    console.log("Submitting order with total:", totalAmount);

    fetch(url, opt)
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Lỗi HTTP! Mã: ${response.status}, Nội dung: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Đã lưu đơn hàng:", data);
        luuchitietdonhang(data.id_dh, cart);
        
        // Kiểm tra phương thức thanh toán và chuyển hướng
        if (paymentMethod === "cod") {
          // Nếu là thanh toán COD, chuyển đến trang Thanks
          navigate("/thanks", { 
            state: { 
              orderInfo: {
                id: data.id_dh,
                total: totalAmount,
                items: cart.length,
                payment: "Thanh toán khi nhận hàng"
              } 
            }
          });
        } else if (paymentMethod === "banking") {
          // Sửa lại: Chuyển đến trang payment với parameters thay vì state
          navigate(`/payment/${data.id_dh}/${totalAmount}/${cart.length}`);
        }
      })
      .catch((error) => {
        console.error("Lỗi lưu đơn hàng:", error);
        alert(`Đã xảy ra lỗi khi đặt hàng: ${error.message}`);
      });
  };

  const luuchitietdonhang = (id_don_hang, cart) => {
    let url = "http://localhost:3000/luugiohang";

    cart.forEach((item) => {
      if (!item.id_sp) {
        console.error("Sản phẩm không có ID:", item);
        return;
      }

      const cartItem = {
        id_don_hang: id_don_hang, 
        id_sp: parseInt(item.id_sp),
        so_luong: parseInt(item.so_luong) || 1,
      };

      console.log("Đang gửi chi tiết sản phẩm:", cartItem);

      fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartItem),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(`Lỗi HTTP! Mã: ${response.status}, Nội dung: ${text}`);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log("Đã lưu sản phẩm vào đơn hàng:", data);
          dispatch(xoaGH());
        })
        .catch((error) => {
          console.error("Lỗi lưu chi tiết đơn hàng:", error);
        });
    });
  };

  const handleEdit = () => {
    setEditedInfo({
      dien_thoai: user.dien_thoai,
      dia_chi: user.dia_chi,
    });
    setEditMode(true);
  };

  const handleSave = () => {
    setUser({
      ...user,
      dien_thoai: editedInfo.dien_thoai,
      dia_chi: editedInfo.dia_chi,
    });
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  if (!user) return <p>Đang tải thông tin...</p>;

  return (
    <div className="box_tong_TT">
      <h2>Thông tin Thanh Toán</h2>

      <div className="customer-info">
        <p>
          <strong>Họ tên:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        {editMode ? (
          <>
            <div className="edit-field">
              <strong>Số điện thoại:</strong>
              <input
                type="text"
                value={editedInfo.dien_thoai}
                onChange={(e) =>
                  setEditedInfo({ ...editedInfo, dien_thoai: e.target.value })
                }
                className="edit-input"
              />
            </div>
            <div className="edit-field">
              <strong>Địa chỉ:</strong>
              <input
                type="text"
                value={editedInfo.dia_chi}
                onChange={(e) =>
                  setEditedInfo({ ...editedInfo, dia_chi: e.target.value })
                }
                className="edit-input"
              />
            </div>
            <div className="edit-buttons">
              <button onClick={handleSave} className="save-btn">
                Lưu
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Hủy
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              <strong>Số điện thoại:</strong> {user.dien_thoai}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {user.dia_chi}
            </p>
            <button onClick={handleEdit} className="edit-btn">
              Sửa thông tin
            </button>
          </>
        )}
      </div>

      <div className="total-amount">
        <strong>Tổng tiền:</strong> {totalAmount.toLocaleString()} VND
      </div>

      <h3>Giỏ hàng của bạn</h3>
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((sp, index) => {
            // Tính giá đúng cho mỗi sản phẩm
            const itemPrice = sp.gia_km !== null && sp.gia_km !== undefined && sp.gia_km > 0
              ? parseFloat(sp.gia_km)
              : parseFloat(sp.gia || 0);
              
            // Đảm bảo số lượng là số
            const quantity = parseInt(sp.so_luong) || 1;
            
            // Tính thành tiền
            const subtotal = itemPrice * quantity;
            
            return (
              <tr key={index}>
                <td>{sp.ten_sp}</td>
                <td>{itemPrice.toLocaleString()} VND</td>
                <td>{quantity}</td>
                <td>{subtotal.toLocaleString()} VND</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="payment-methods">
        <h3>Phương thức thanh toán</h3>
        <div className="payment-options">
          <div
            className={`payment-option ${
              paymentMethod === "cod" ? "selected" : ""
            }`}
            onClick={() => setPaymentMethod("cod")}
          >
            <div className="payment-icon">
              <i className="fas fa-truck"></i>
            </div>
            <div className="payment-details">
              <h4>Thanh toán khi nhận hàng</h4>
              <p>Thanh toán bằng tiền mặt khi nhận được hàng</p>
            </div>
          </div>

          <div
            className={`payment-option ${
              paymentMethod === "banking" ? "selected" : ""
            }`}
            onClick={() => setPaymentMethod("banking")}
          >
            <div className="payment-icon">
              <i className="fas fa-university"></i>
            </div>
            <div className="payment-details">
              <h4>Thanh toán qua ngân hàng</h4>
              <p>Chuyển khoản qua QR code</p>
            </div>
          </div>
        </div>
      </div>

      <button className="button_TT" onClick={submitDuLieu}>
        {paymentMethod === "banking" ? "Thanh toán qua ngân hàng" : "Đặt hàng"}
      </button>
    </div>
  );
}

export default ThanhToan;
