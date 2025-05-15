import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PhanTrang from './PhanTrang';
import Danhmuc from "./danhmuc";
    
function NameOneKind() {
    let { id } = useParams();
        const [loai, listLoai] = useState([]);
        useEffect(() => {
            fetch(`http://localhost:3000/loai/${id}`)
                .then(res =>  res.json())
                .then(data => {listLoai(data);});
        }, [id]);

        return (
            <div id="oneKind" className="titile_SP" style={{marginLeft:'5%'}}>
                <div >
                    <Danhmuc/>
                </div>
                <div >
                    <h2>Sản phẩm thương hiệu <strong>{loai.ten_loai}</strong></h2>
                </div>
                <hr className="h_r" style={{marginLeft:'1px',width:'10%',border:'2px solid #008b8b'}}></hr>
            </div>
        );
}

function ShowProductOneKind() {
    document.title = "Sản phẩm theo loại";
    let { id } = useParams();
    const [spTheoLoai, setSanPhamTrongLoai] = useState([]);
    const [daSapXep, setDaSapXep] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 20;

    useEffect(() => {
        fetch(`http://localhost:3000/sptrongloai/${id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSanPhamTrongLoai(data);
                    setTotalItems(data.length);
                    setCurrentPage(1); // Reset to first page when products change
                } else {
                    setSanPhamTrongLoai([]);
                    setTotalItems(0);
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setSanPhamTrongLoai([]);
                setTotalItems(0);
            });
    }, [id]);

    const sapXepSanPhamHot = () => {
        if (!Array.isArray(spTheoLoai)) return;
        
        const sx = [...spTheoLoai].filter(sp => sp.luot_xem > 500);
        setSanPhamTrongLoai(sx);
        setTotalItems(sx.length);
        setCurrentPage(1); // Reset to first page after sorting
        setDaSapXep(true);
    };
    
    const sapXepGiaTang = () => {
        if (!Array.isArray(spTheoLoai)) return;
        
        const sx = [...spTheoLoai].sort((a, b) => {
            // Sắp xếp theo giá khuyến mãi (gia_km), nếu không có thì dùng giá gốc (gia)
            const giaA = parseFloat(a.gia_km || a.gia);
            const giaB = parseFloat(b.gia_km || b.gia);
            return giaA - giaB;
        });
        setSanPhamTrongLoai(sx);
        setTotalItems(sx.length);
        setCurrentPage(1); // Reset to first page after sorting
        setDaSapXep(true);
    };
    
    const sapXepGiaGiam = () => {
        if (!Array.isArray(spTheoLoai)) return;
        
        const sx = [...spTheoLoai].sort((a, b) => {
            // Sắp xếp theo giá khuyến mãi (gia_km), nếu không có thì dùng giá gốc (gia)
            const giaA = parseFloat(a.gia_km || a.gia);
            const giaB = parseFloat(b.gia_km || b.gia);
            return giaB - giaA;
        });
        setSanPhamTrongLoai(sx);
        setTotalItems(sx.length);
        setCurrentPage(1); // Reset to first page after sorting
        setDaSapXep(true);
    };

    // Tính toán hiển thị sản phẩm cho trang hiện tại
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return spTheoLoai.slice(startIndex, endIndex);
    };

    // Hàm xử lý khi chuyển trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Cuộn lên đầu khi chuyển trang
        window.scrollTo(0, 0);
    };

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / pageSize);
    
    return (
        <div>
            <NameOneKind loai={spTheoLoai} />
            <div className='nut_chon_sap_xep'>
                   <h4 id='title' style={{fontWeight:'550',fontSize:'20px'}}>Sắp xếp theo</h4>
                   <div className='nut_chon'>
                       <button style={{marginRight:'10px'}} type="button" className="btn btn-outline-secondary nut_chon_button" onClick={sapXepGiaGiam}><i className="bi bi-sort-down"></i> Giá Khuyến Mãi Cao - Thấp</button>
                       <button style={{marginRight:'10px'}} type="button" className="btn btn-outline-secondary nut_chon_button" onClick={sapXepGiaTang}><i className="bi bi-sort-down-alt"></i> Giá Khuyến Mãi Thấp - Cao</button>
                       <button style={{marginRight:'10px'}} type="button" className="btn btn-outline-secondary nut_chon_button" onClick={sapXepSanPhamHot}><i className="bi bi-eye"></i> Xem nhiều </button>
                   </div>
            </div>
            <PhanTrang 
                listSP={getCurrentPageItems()} 
                pageSize={pageSize} 
                daSapXep={daSapXep} 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
            />
            <div className="phan-trang-controls">
                {totalPages > 1 && (
                    <div className="pagination-buttons">
                        <button 
                            onClick={() => handlePageChange(1)} 
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            <i className="bi bi-chevron-double-left"></i>
                        </button>
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="pagination-button"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        
                        {/* Hiển thị các nút trang */}
                        {[...Array(totalPages)].map((_, index) => {
                            // Chỉ hiển thị 5 nút trang xung quanh trang hiện tại
                            if (
                                index + 1 === 1 || 
                                index + 1 === totalPages ||
                                (index + 1 >= currentPage - 2 && index + 1 <= currentPage + 2)
                            ) {
                                return (
                                    <button 
                                        key={index}
                                        onClick={() => handlePageChange(index + 1)} 
                                        className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            } else if (
                                (index + 1 === currentPage - 3 && currentPage > 4) || 
                                (index + 1 === currentPage + 3 && currentPage < totalPages - 3)
                            ) {
                                return <span key={index} className="pagination-ellipsis">...</span>;
                            }
                            return null;
                        })}
                        
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                        <button 
                            onClick={() => handlePageChange(totalPages)} 
                            disabled={currentPage === totalPages}
                            className="pagination-button"
                        >
                            <i className="bi bi-chevron-double-right"></i>
                        </button>
                    </div>
                )}
                <div className="pagination-info">
                    Hiển thị {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} trên tổng số {totalItems} sản phẩm
                </div>
            </div>
            <div className="troVe"><a href="#oneKind"><i className="bi bi-arrow-up-short"></i></a></div>
        </div>
    );
}

export default ShowProductOneKind;
