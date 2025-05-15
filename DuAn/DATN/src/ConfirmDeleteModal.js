import React from 'react';
import './logout.css';

function ConfirmDeleteModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <span className="modal-icon">🗑️</span>
          <h3>Xác nhận xóa sản phẩm?</h3>
        </div>
        <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?</p>
        <div className="modal-actions">
          <button className="btn-confirm" onClick={onConfirm}>Xóa</button>
          <button className="btn-cancel" onClick={onCancel}>Huỷ</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
