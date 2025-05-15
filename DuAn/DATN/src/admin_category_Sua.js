// admin_category_Sua.js
import { useState, useEffect } from "react";
import './admin_css/admin_category.css';
import { showNotification } from './components/NotificationContainer';

function AdminCategorySua({ setRefresh, category, setSelectedCategory }) {
    const [thongBao, setThongBao] = useState(false);
    const [loai, setLoai] = useState({
        ten_loai: '',
        img_loai: '',
        slug: '',
        thu_tu: '',
        an_hien: 1
    });

    useEffect(() => {
        if (category) {
            setLoai(category);
        }
    }, [category]);

    const xuliInput = (e) => {
        const { id, value } = e.target;
        setLoai(prev => ({ ...prev, [id]: value }));
    };

    const xuliRadio = (e) => {
        setLoai(prev => ({ ...prev, an_hien: parseInt(e.target.value) }));
    };

    const submitDuLieu = async () => {
        try {
            const url = `http://localhost:3000/admin/category/${loai.id}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loai)
            });
            
            const data = await response.json();
            
            if (data.error) {
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: data.error
                });
                return;
            }

            showNotification({
                type: 'success',
                title: 'Thành công',
                message: data.thongbao
            });
            setRefresh(prev => !prev);
            
            // Đóng modal
            const closeButton = document.querySelector('#exampleModal2 .btn-close');
            if (closeButton) {
                closeButton.click();
            }

        } catch (error) {
            console.error("Lỗi khi cập nhật danh mục:", error);
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: 'Có lỗi xảy ra khi cập nhật danh mục'
            });
        }
    };

    return (
        <div>
            <div className="notification-container">
                {thongBao && (
                    <div className="notification success">
                        <i className="fas fa-check-circle"></i> Sửa danh mục thành công!
                    </div>
                )}
            </div>
            <div className="modal fade" id="exampleModal2" tabIndex="-1" aria-labelledby="exampleModal2Label" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModal2Label">Sửa Danh Mục</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label htmlFor="ten_loai" className="form-label">Tên danh mục:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="ten_loai" 
                                    value={loai.ten_loai || ''} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="img_loai" className="form-label">Hình ảnh:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="img_loai" 
                                    value={loai.img_loai || ''} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập URL hình ảnh"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="slug" className="form-label">Slug:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="slug" 
                                    value={loai.slug || ''} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập slug"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="thu_tu" className="form-label">Thứ tự:</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="thu_tu" 
                                    value={loai.thu_tu || ''} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập thứ tự"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Trạng thái:</label>
                                <div className="form-check form-check-inline">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="an_hien" 
                                        id="hien" 
                                        value="1" 
                                        checked={loai.an_hien === 1} 
                                        onChange={xuliRadio} 
                                    />
                                    <label className="form-check-label" htmlFor="hien">Hiện</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="an_hien" 
                                        id="an" 
                                        value="0" 
                                        checked={loai.an_hien === 0} 
                                        onChange={xuliRadio} 
                                    />
                                    <label className="form-check-label" htmlFor="an">Ẩn</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" className="btn btn-primary" onClick={submitDuLieu}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminCategorySua;