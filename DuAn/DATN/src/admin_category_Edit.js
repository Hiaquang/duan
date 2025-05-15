import { useState, useEffect } from "react";
import { showNotification } from './components/NotificationContainer';
import './admin_css/admin_category.css';

function AdminCategoryEdit({ loai, setRefresh }) {
    const [editedLoai, setEditedLoai] = useState({
        id: "",
        ten_loai: "",
        img_loai: "",
        slug: "",
        thu_tu: "",
        an_hien: 1
    });

    useEffect(() => {
        if (loai) {
            setEditedLoai({
                id: loai.id,
                ten_loai: loai.ten_loai || "",
                img_loai: loai.img_loai || "",
                slug: loai.slug || "",
                thu_tu: loai.thu_tu || "",
                an_hien: loai.an_hien || 1
            });
        }
    }, [loai]);

    const xuliInput = (e) => {
        const { id, value } = e.target;
        setEditedLoai(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const xuliRadio = (e) => {
        setEditedLoai(prev => ({
            ...prev,
            an_hien: parseInt(e.target.value)
        }));
    };

    const submitDuLieu = async (e) => {
        if (e) e.preventDefault();
        
        // Kiểm tra dữ liệu đầu vào
        if (!editedLoai.ten_loai || !editedLoai.img_loai) {
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: 'Vui lòng nhập đầy đủ thông tin tên danh mục và hình ảnh!'
            });
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:3000/admin/category/${editedLoai.id}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedLoai)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Có lỗi xảy ra khi cập nhật danh mục');
            }

            showNotification({
                type: 'success',
                title: 'Thành công',
                message: data.thongbao || "Cập nhật danh mục thành công!"
            });
            
            setRefresh(prev => !prev);
            
            // Đóng modal
            const modalElement = document.getElementById('editModal');
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }

        } catch (error) {
            console.error('Error:', error);
            showNotification({
                type: 'error',
                title: 'Lỗi',
                message: error.message || 'Có lỗi xảy ra khi cập nhật danh mục!'
            });
        }
    };

    return (
        <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="editModalLabel">Sửa Danh Mục</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={submitDuLieu}>
                            <div className="mb-3">
                                <label htmlFor="ten_loai" className="col-form-label">Tên danh mục:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="ten_loai" 
                                    value={editedLoai.ten_loai} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="img_loai" className="col-form-label">Hình ảnh:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="img_loai" 
                                    value={editedLoai.img_loai} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập URL hình ảnh"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="slug" className="col-form-label">Slug:</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="slug" 
                                    value={editedLoai.slug} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập slug"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="thu_tu" className="col-form-label">Thứ tự:</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    id="thu_tu" 
                                    value={editedLoai.thu_tu} 
                                    onChange={xuliInput} 
                                    placeholder="Nhập thứ tự hiển thị"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="col-form-label d-block">Trạng thái:</label>
                                <div className="form-check form-check-inline">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="an_hien" 
                                        id="hien" 
                                        value="1" 
                                        checked={editedLoai.an_hien === 1} 
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
                                        checked={editedLoai.an_hien === 0} 
                                        onChange={xuliRadio} 
                                    />
                                    <label className="form-check-label" htmlFor="an">Ẩn</label>
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

export default AdminCategoryEdit;