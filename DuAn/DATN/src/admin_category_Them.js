import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './admin_css/admin_category.css';

function AdminCategoryThem({ setRefresh }) {
    const [loai, setLoai] = useState({
        ten_loai: "",
        img_loai: "",
        slug: "",
        thu_tu: "",
        an_hien: 1,
    });

    const navigate = useNavigate();

    const xuliInput = (e) => {
        const { name, value } = e.target;
        setLoai({ ...loai, [name]: value });
    };

    const submitDuLieu = async () => {
        try {
            // Validate required fields
            if (!loai.ten_loai || !loai.img_loai) {
                alert('Vui lòng nhập đầy đủ tên danh mục và hình ảnh!');
                return;
            }
            const response = await fetch("http://localhost:3000/admin/category", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loai),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.thongbao || "Lỗi khi thêm danh mục");
            setRefresh((prev) => !prev);
            // Đóng modal nếu có
            const modalElement = document.getElementById('addCategoryModal');
            if (window.bootstrap && modalElement) {
                const modal = window.bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
            alert('Thêm danh mục thành công!');
        } catch (error) {
            alert(error.message || "Lỗi khi thêm danh mục");
            console.error("Lỗi khi thêm danh mục:", error);
        }
    };

    return (
        <div className="admin_category_them">
            <h2 className="form-title">Thêm danh mục</h2>
            <form className="category-form">
                <div className="form-group">
                    <label className="form-label">Tên danh mục</label>
                    <input type="text" name="ten_loai" className="form-control" placeholder="Tên danh mục" onChange={xuliInput} />
                </div>
                <div className="form-group">
                    <label className="form-label">Hình ảnh</label>
                    <input type="text" name="img_loai" className="form-control" placeholder="Hình ảnh" onChange={xuliInput} />
                </div>
                <div className="form-group">
                    <label className="form-label">Slug</label>
                    <input type="text" name="slug" className="form-control" placeholder="Slug" onChange={xuliInput} />
                </div>
                <div className="form-group">
                    <label className="form-label">Thứ tự</label>
                    <input type="number" name="thu_tu" className="form-control" placeholder="Thứ tự" onChange={xuliInput} />
                </div>
                <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select name="an_hien" className="form-control" onChange={xuliInput} defaultValue={1}>
                        <option value={1}>Hiện</option>
                        <option value={0}>Ẩn</option>
                    </select>
                </div>
                <button type="button" className="btn btn-primary" onClick={submitDuLieu}>
                    Thêm
                </button>
            </form>
        </div>
    );
}

export default AdminCategoryThem;
