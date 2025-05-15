import React from 'react';
import './boxPro.css';
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { themSP } from "./cartSlice";
import { themVaoSoSanh } from "./compareSlice"; // Import action so sánh
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HienSPTrongMotTrang({ spTrongTrang }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [thongBao, setThongBao] = useState(false);

    const xuli = (sanpham) => {
        dispatch(themSP(sanpham));
        setThongBao(true);
        setTimeout(() => setThongBao(false), 3000);
    };

    // const themSoSanh = (sanpham) => {
    //     console.log("Sản phẩm được thêm vào so sánh:", sanpham);
    //     dispatch(themVaoSoSanh(sanpham));
    // };
    const themSoSanhVaChuyenTrang = (sanpham) => {
        console.log("🔍 Sản phẩm thêm vào so sánh:", sanpham);
        dispatch(themVaoSoSanh(sanpham));
        setThongBao(true);
        setTimeout(() => {
            setThongBao(false);
            navigate("/so-sanh"); // Chuyển đến trang so sánh sau khi thêm sản phẩm
        }, 1000);
    };

    return (
        <div className="list_tong_box_SP">
            {thongBao && (
                <div className="thongbao">
                    Đã thêm vào so sánh
                </div>
            )}
            {spTrongTrang.map((sp, i) => (
                <div className="list_box_SP" key={i}>
                    <div className="list_box_SP_anh">
                        <img src={sp.hinh} title={(sp.ten_sp).toLocaleUpperCase()} alt={sp.ten_sp} />
                    </div>
                    <div className="list_box_SP_tensp">
                        <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>{sp.ten_sp}</Link>
                    </div>
                    <div className='list_cart_icon' onClick={() => xuli(sp)}>
                        <i className="bi bi-bag-plus-fill"></i>
                    </div>
                    <div className="list_box_SP_RAM_SSD">
                        <div><button className="list_box_SP_RAM">RAM: {sp.ram}</button></div>
                        <div><button className="list_box_SP_SSD">SSD: {sp.dia_cung}</button></div>
                    </div>
                    <div className="list_box_SP_gia">
                        <div className="list_box_SP_gia_km">{parseFloat(sp.gia_km).toLocaleString("vi")} VNĐ</div>
                        <div className="list_box_SP_gia_goc"><del>{parseFloat(sp.gia).toLocaleString("vi")} VNĐ</del></div>
                    </div>
                    <div className="list_box_SP_luot_xem"><p>Lượt xem: {sp.luot_xem}</p></div>
                    <div className="list_box_SP_icon">
                        <div className="list_box_SP_icon_star">
                            <div className="list_box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                            <div className="list_box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                            <div className="list_box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                            <div className="list_box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                            <div className="list_box_SP_icon_star_nhat"><i className="bi bi-star-fill"></i></div>
                            <div className="list_box_SP_icon_star_dg"><p>(Đánh giá)</p></div>
                        </div>
                        <div className="list_so_sanh">
                            <button className="list_so_sanh_btn" onClick={() => themSoSanhVaChuyenTrang(sp)}>
                                So sánh
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default HienSPTrongMotTrang;