import React, { useEffect, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './PayMent.css';

function PayMent() {
  const { id, tong_tien, total_quantity } = useParams();
  const navigate = useNavigate();

  // Thông tin ngân hàng
  const bankInfo = {
    bankName: "MB Bank",
    accountNumber: "0393786387",
    accountName: "LE ANH KHOA",
    amount: tong_tien,
    description: `DH${id}`
  };

  // Link QR cố định hoặc có thể thay đổi theo id đơn hàng
  const qrUrl = `https://api.vietqr.io/MB/${bankInfo.accountNumber}/${bankInfo.amount}/DH${id}/vietqr_net_2.jpg?accountName=${encodeURIComponent(bankInfo.accountName)}`;

  const sendCheckRequest = useCallback(() => {
    const url = 'https://e.giangcoder.com/api/check';
    const data = { id_dh: id };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(result => {
        if (result.status === "success") {
          fetch('http://localhost:3000/completed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // Gửi id_dh ở đây
          })
            .then(() => {

             navigate('/thanks');
            })
            .catch(err => {
              console.error('Error notifying completion:', err);
              // Vẫn điều hướng ngay cả khi request thứ hai lỗi
              // navigate('/thanks');
            });
        }
      })
      .catch(error => {
        console.error('Error checking order:', error);
      });
  }, [id, navigate]);

  useEffect(() => {
    // Set an interval to send a request every second (1000ms)
    const interval = setInterval(() => {
      sendCheckRequest();
    }, 1000); // Every 1000ms = 1 second

    // Cleanup interval when the component unmounts
    return () => clearInterval(interval);
  }, [sendCheckRequest]);

  return (
    <div className="payment-container">
      <h2>Thanh toán đơn hàng</h2>

      <div className="payment-info">
        <p>
          <strong>Mã đơn hàng:</strong>
          <span>DH{id}</span>
        </p>
        <p>
          <strong>Tổng số lượng sản phẩm:</strong>
          <span>{total_quantity || 0} sản phẩm</span>
        </p>
        <p>
          <strong>Tổng tiền hàng:</strong>
          <span>{Number(tong_tien).toLocaleString()} VND</span>
        </p>
      </div>

      <div className="bank-info">
        <h3>Thông tin chuyển khoản</h3>
        <div className="bank-details">
          <p><strong>Ngân hàng:</strong> {bankInfo.bankName}</p>
          <p><strong>Số tài khoản:</strong> {bankInfo.accountNumber}</p>
          <p><strong>Tên tài khoản:</strong> {bankInfo.accountName}</p>
          <p><strong>Số tiền:</strong> {Number(bankInfo.amount).toLocaleString()} VND</p>
          {/* //<p><strong>Nội dung CK:</strong> {bankInfo.description}</p> */}
        </div>
      </div>

      <div className="qr-section">
        <h3>Quét mã QR để thanh toán</h3>
        <img
          src={qrUrl}
          alt="QR Code"
          className="qr-code"
        />
        <div className="qr-note">
          <p>Sử dụng App Mobile Banking quét mã để thanh toán</p>
          <p>Đơn hàng sẽ tự động xác nhận sau khi nhận được thanh toán</p>
        </div>
      </div>

      <div className="payment-status">
        Đang chờ thanh toán<span className="loading-dots"></span>
      </div>

      <div className="payment-note">
        <i>Vui lòng không tắt trang này cho đến khi thanh toán hoàn tất</i>
      </div>
    </div>
  );
}

export default PayMent;
