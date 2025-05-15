import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { showNotification } from './components/NotificationContainer';
import './admin_css/admin_product.css';

function AdminProductSua({ setRefresh, selectedProduct }) {
    const { token } = useSelector((state) => state.auth);
    const [sp, setSp] = useState({
        ten_sp: "",
        hinh: "",
        gia_km: "",
        gia: "",
        ngay: "",
        cpu: "",
        ram: "",
        dia_cung: "",
        mau_sac: "",
        can_nang: "",
        id_loai: "",
        luot_xem: 0
    });

    useEffect(() => {
        if (selectedProduct) {
            setSp({
                ...selectedProduct,
                ngay: selectedProduct.ngay ? new Date(selectedProduct.ngay).toISOString().split('T')[0] : ""
            });
        }
    }, [selectedProduct]);

    const xuliInput = (e) => {
        const { id, value } = e.target;
        setSp(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const xuliid_loai = (e) => {
        setSp(prev => ({
            ...prev,
            id_loai: parseInt(e.target.value)
        }));
    };

    const submitDuLieu = async (e) => {
        e.preventDefault();
        
        if (!sp.ten_sp || !sp.hinh || !sp.gia || !sp.id_loai) {
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: 'Vui lòng nhập đầy đủ thông tin bắt buộc!'
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/admin/sp/${sp.id}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sp)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
            }

            showNotification({
                type: 'success',
                title: 'Thành công',
                message: 'Cập nhật sản phẩm thành công!'
            });
            
            setRefresh(prev => !prev);
            
            // Đóng modal
            const modalElement = document.getElementById('exampleModal2');
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

        } catch (error) {
            console.error('Error:', error);
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm!'
            });
        }
    };

    return (
        <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModal2Label" aria-hidden="true">
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModal2Label">Sửa sản phẩm</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={submitDuLieu}>
                            <div style={{ margin: '10px' }}>
                                <div className="mb-3">
                                    <label htmlFor="ten_sp" className="col-form-label">Tên sản phẩm <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="ten_sp" value={sp.ten_sp || ''} onChange={xuliInput} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="hinh" className="col-form-label">Hình ảnh <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="hinh" value={sp.hinh || ''} onChange={xuliInput} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="gia_km" className="col-form-label">Giá khuyến mãi</label>
                                    <input type="number" className="form-control" id="gia_km" value={sp.gia_km || ''} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="gia" className="col-form-label">Giá gốc <span className="text-danger">*</span></label>
                                    <input type="number" className="form-control" id="gia" value={sp.gia || ''} onChange={xuliInput} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="ngay" className="col-form-label">Ngày nhập</label>
                                    <input type="date" className="form-control" id="ngay" value={sp.ngay || ''} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="luot_xem" className="col-form-label">Lượt xem</label>
                                    <input type="number" className="form-control" id="luot_xem" value={sp.luot_xem || ''} onChange={xuliInput} />
                                </div>
                            </div>
                            <div style={{ margin: '10px' }}>
                                <div className="mb-3">
                                    <label htmlFor="id_loai" className="col-form-label">Loại sản phẩm <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select"
                                        value={sp.id_loai || 0}
                                        onChange={xuliid_loai}
                                        required
                                    >
                                        <option value={0}>Chọn loại sản phẩm</option>
                                        <option value={1}>Asus</option>
                                        <option value={2}>Acer</option>
                                        <option value={3}>Dell</option>
                                        <option value={4}>HP</option>
                                        <option value={5}>Lenovo</option>
                                        <option value={6}>MSI</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="cpu" className="col-form-label">CPU</label>
                                    <input type="text" className="form-control" id="cpu" value={sp.cpu || ''} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="ram" className="col-form-label">RAM</label>
                                    <input type="text" className="form-control" id="ram" value={sp.ram || ''} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="dia_cung" className="col-form-label">Ổ cứng</label>
                                    <input type="text" className="form-control" id="dia_cung" value={sp.dia_cung || ''} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="mau_sac" className="col-form-label">Màu sắc</label>
                                    <input type="text" className="form-control" id="mau_sac" value={sp.mau_sac || ''} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="can_nang" className="col-form-label">Cân nặng</label>
                                    <input type="text" className="form-control" id="can_nang" value={sp.can_nang || ''} onChange={xuliInput} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                                <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProductSua;
