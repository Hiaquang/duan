import React from 'react';
import { Link } from 'react-router-dom';

function PhanTrang({ listSP, pageSize, daSapXep, currentPage, totalPages, onPageChange, totalItems }) {
    // We're no longer handling pagination internally
    // Instead, we're just displaying the products passed to us

    return (
        <div>
            <div className="tong_box_SP">
                {listSP && listSP.length > 0 ? (
                    listSP.map((sp, i) => (
                        <div className="box_SP" key={i}>
                            {/* Tính giảm giá nếu có */}
                            {sp.gia && sp.gia_km && sp.gia > sp.gia_km && (
                                <div className="box_SP_khuyen_mai">
                                    Giảm {Math.round(((sp.gia - sp.gia_km) / sp.gia) * 100)}%
                                </div>
                            )}
                            <div className="box_SP_anh">
                                <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>
                                    <img src={sp.hinh} title={sp.ten_sp} alt={sp.ten_sp} />
                                </Link>
                            </div>
                            <div className="box_SP_tensp">
                                <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>{sp.ten_sp}</Link>
                            </div>
                            <div className="box_SP_gia">
                                <div className="box_SP_gia_km" style={{color: '#ff0000', fontWeight: 'bold'}}>
                                    {parseFloat(sp.gia_km || sp.gia).toLocaleString("vi")} VNĐ
                                </div>
                                {sp.gia_km && sp.gia_km !== sp.gia && (
                                    <div className="box_SP_gia_goc" style={daSapXep ? {color: '#999'} : {}}>
                                        <del>{parseFloat(sp.gia).toLocaleString("vi")} VNĐ</del>
                                    </div>
                                )}
                            </div>
                            <div className="box_SP_luot_xem"><p>Lượt xem: {sp.luot_xem}</p></div>
                        </div>
                    ))
                ) : (
                    <div className="no-products">
                        <p>Không có sản phẩm nào phù hợp với tiêu chí.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PhanTrang;