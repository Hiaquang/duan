import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from './components/NotificationContainer';
import './admin_css/admin_product.css';

function AdminProductThem({ setRefresh, adminListSP }) {
    const [sp, setSp] = useState({
        ten_sp: '',
        hinh: '',
        gia_km: '0',
        gia: '0',
        ngay: new Date().toISOString().split('T')[0],
        luot_xem: '0',
        id_loai: 0,
        ram: '',
        cpu: '',
        dia_cung: '',
        mau_sac: '',
        can_nang: '',
        mota: '',
        thongtin: '',
        an_hien: true
    });

    const navigate = useNavigate();

    const getNextId = () => {
        if (!adminListSP || adminListSP.length === 0) return 1;
        
        // Lọc và chuyển đổi các ID hợp lệ
        const validIds = adminListSP
            .map(item => parseInt(item.id))
            .filter(id => !isNaN(id) && id > 0); // Chỉ lấy ID > 0
        
        if (validIds.length === 0) return 1;
        
        // Lấy ID lớn nhất và cộng 1
        const maxId = Math.max(...validIds);
        console.log('Current max ID:', maxId);
        const nextId = maxId + 1;
        console.log('Next ID will be:', nextId);
        return nextId;
    };

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
            id_loai: parseInt(e.target.value, 10)
        }));
    };

    const closeModal = () => {
        const closeButton = document.querySelector('#exampleModal [data-bs-dismiss="modal"]');
        if (closeButton) {
            closeButton.click();
        }
    };

    const resetForm = () => {
        setSp({
            ten_sp: '',
            hinh: '',
            gia_km: '0',
            gia: '0',
            ngay: new Date().toISOString().split('T')[0],
            luot_xem: '0',
            id_loai: 0,
            ram: '',
            cpu: '',
            dia_cung: '',
            mau_sac: '',
            can_nang: '',
            mota: '',
            thongtin: '',
            an_hien: true
        });
    };

    const submitDuLieu = async (e) => {
        e.preventDefault();
        try {
            // Validate required fields
            if (!sp.ten_sp || !sp.hinh || !sp.gia || !sp.id_loai) {
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: 'Vui lòng điền đầy đủ thông tin sản phẩm'
                });
                return;
            }

            // Validate numeric fields
            if (isNaN(parseFloat(sp.gia)) || (sp.gia_km && isNaN(parseFloat(sp.gia_km)))) {
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: 'Giá sản phẩm phải là số'
                });
                return;
            }

            // Format data before sending
            const productData = {
                ten_sp: sp.ten_sp.trim(),
                hinh: sp.hinh.trim(),
                gia: parseFloat(sp.gia),
                gia_km: sp.gia_km ? parseFloat(sp.gia_km) : parseFloat(sp.gia),
                ngay: sp.ngay || new Date().toISOString().split('T')[0],
                luot_xem: 0,
                id_loai: parseInt(sp.id_loai),
                ram: sp.ram?.trim() || '',
                cpu: sp.cpu?.trim() || '',
                dia_cung: sp.dia_cung?.trim() || '',
                mau_sac: sp.mau_sac?.trim() || '',
                can_nang: sp.can_nang?.trim() || '',
                an_hien: 1
            };

            console.log('Sending product data:', productData);

            const response = await fetch("http://localhost:3000/admin/sp", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.thongbao || 'Có lỗi xảy ra khi thêm sản phẩm');
            }

            const responseData = await response.json();
            console.log('Server response:', responseData);

            showNotification({
                type: 'success',
                title: 'Thành công',
                message: 'Thêm sản phẩm thành công'
            });

            // Reset form
            resetForm();

            // Tìm và click nút đóng modal
            const closeButton = document.querySelector('#exampleModal [data-bs-dismiss="modal"]');
            if (closeButton) {
                closeButton.click();
            }

            // Refresh dữ liệu
            setRefresh(prev => !prev);
            
            // Chuyển hướng sau khi modal đã đóng
            setTimeout(() => {
                navigate('/admin/product', { replace: true });
            }, 300);

        } catch (error) {
            console.error('Error details:', error);
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: error.message || 'Có lỗi xảy ra khi thêm sản phẩm'
            });
        }
    };

    return (
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel" style={{ fontWeight: '600', color: "black" }}>Thêm sản phẩm</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={submitDuLieu} style={{ display: "grid", gridTemplateColumns: "50% 50%" }}>
                            <div style={{ margin: '10px' }}>
                                <div className="mb-3">
                                    <label htmlFor="ten_sp" className="col-form-label">Tên sản phẩm <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control" id="ten_sp" value={sp.ten_sp} onChange={xuliInput} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="hinh" className="col-form-label">Hình ảnh</label>
                                    <input type="text" className="form-control" id="hinh" value={sp.hinh} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="gia_km" className="col-form-label">Giá khuyến mãi</label>
                                    <input type="number" className="form-control" id="gia_km" value={sp.gia_km} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="gia" className="col-form-label">Giá gốc</label>
                                    <input type="number" className="form-control" id="gia" value={sp.gia} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="ngay" className="col-form-label">Ngày nhập</label>
                                    <input type="date" className="form-control" id="ngay" value={sp.ngay} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="luot_xem" className="col-form-label">Lượt xem</label>
                                    <input type="number" className="form-control" id="luot_xem" value={sp.luot_xem} onChange={xuliInput} />
                                </div>
                            </div>
                            <div style={{ margin: '10px' }}>
                                <div className="mb-3">
                                    <label htmlFor="id_loai" className="col-form-label">Loại sản phẩm <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select"
                                        value={sp.id_loai}
                                        onChange={xuliid_loai}
                                        required
                                    >
                                        <option value={0}>Chọn loại sản phẩm</option>
                                        <option value={1}>Asus</option>
                                        <option value={2}>Acer</option>
                                        <option value={3}>Lenovo</option>
                                        <option value={4}>MSI</option>
                                        <option value={5}>HP</option>
                                        <option value={6}>Dell</option>
                                        <option value={7}>Apple</option>
                                        <option value={8}>Surface</option>
                                        <option value={9}>Masstel</option>
                                        <option value={10}>LG</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="ram" className="col-form-label">Ram</label>
                                    <input type="text" className="form-control" id="ram" value={sp.ram} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="cpu" className="col-form-label">CPU</label>
                                    <input type="text" className="form-control" id="cpu" value={sp.cpu} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="dia_cung" className="col-form-label">Đĩa cứng</label>
                                    <input type="text" className="form-control" id="dia_cung" value={sp.dia_cung} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="mau_sac" className="col-form-label">Màu sắc</label>
                                    <input type="text" className="form-control" id="mau_sac" value={sp.mau_sac} onChange={xuliInput} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="can_nang" className="col-form-label">Cân nặng</label>
                                    <input type="text" className="form-control" id="can_nang" value={sp.can_nang} onChange={xuliInput} />
                                </div>
                            </div>
                            <div className="modal-footer" style={{ gridColumn: "1 / -1" }}>
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                                <button type="submit" className="btn btn-primary">Xác nhận</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminProductThem;
