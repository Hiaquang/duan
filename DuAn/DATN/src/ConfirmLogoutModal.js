import React from 'react';
import './logout.css';

function ConfirmLogoutModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-icon">🚪</span>
          <h3>Đăng xuất khỏi tài khoản?</h3>
        </div>
        <p>Bạn có muốn đăng xuất khỏi tài khoản không? Mọi thay đổi chưa lưu sẽ bị mất.</p>
        <div className="modal-actions">
          <button className="btn-confirm" onClick={onConfirm}>Đăng xuất ngay</button>
          <button className="btn-cancel" onClick={onCancel}>Ở lại</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmLogoutModal;
