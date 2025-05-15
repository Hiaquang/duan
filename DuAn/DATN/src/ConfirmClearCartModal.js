import React from 'react';
import './logout.css';

function ConfirmClearCartModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-icon">🗑️</span>
          <h3>Xác nhận xóa toàn bộ giỏ hàng?</h3>
        </div>
        <p>Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?</p>
        <div className="modal-actions">
          <button className="btn-confirm" onClick={onConfirm}>Xóa tất cả</button>
          <button className="btn-cancel" onClick={onCancel}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmClearCartModal;
