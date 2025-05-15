import React, { useEffect, useState } from 'react';
import './boxPro.css';
import './App.css';
import banner_n1 from './img/banner_n1.webp';
import banner5 from './img/banner5.jpg';
import { Link, useNavigate } from "react-router-dom";
import { themVaoSoSanh, xoaKhoiSoSanh } from './compareSlice'; // Thêm xoaKhoiSoSanh nếu có
import { useDispatch, useSelector } from 'react-redux';
import { themSP } from './cartSlice';
import './home_sosanh.css';

function Home() {
    document.title = "Trang chủ";
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const daDangNhap = useSelector(state => state.auth.daDangNhap);
    const [listsp, ganListSP] = useState([]);
    const [originalListsp, setOriginalListsp] = useState([]);
    const danhSachSoSanh = useSelector(state => state.compare.danhSachSoSanh); // Lấy từ Redux
    const [isCompareBoxVisible, setIsCompareBoxVisible] = useState(false);
    const [thongBaoCart, setThongBaoCart] = useState(false);
    const [thongBaoSoSanh, setThongBaoSoSanh] = useState(false);
    const [thongBaoMaxSoSanh, setThongBaoMaxSoSanh] = useState(false);
    const [daSapXep, setDaSapXep] = useState(false);

    useEffect(() => {
        fetch("http://localhost:3000/spmoi/1")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    ganListSP(data);
                    setOriginalListsp(data);
                } else {
                    ganListSP([]);
                    setOriginalListsp([]);
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                ganListSP([]);
                setOriginalListsp([]);
            });
    }, []);

    useEffect(() => {
        const isVisible = localStorage.getItem('isCompareBoxVisible') === 'true';
        setIsCompareBoxVisible(isVisible);
    }, []);

    const sapXepGiaTang = () => {
        if (!Array.isArray(listsp)) return;
        
        const sx = [...listsp].sort((a, b) => {
            const giaA = parseFloat(a.gia_km || a.gia);
            const giaB = parseFloat(b.gia_km || b.gia);
            return giaA - giaB;
        });
        ganListSP(sx);
        setDaSapXep(true);
    };

    const sapXepGiaGiam = () => {
        if (!Array.isArray(listsp)) return;
        
        const sx = [...listsp].sort((a, b) => {
            const giaA = parseFloat(a.gia_km || a.gia);
            const giaB = parseFloat(b.gia_km || b.gia);
            return giaB - giaA;
        });
        ganListSP(sx);
        setDaSapXep(true);
    };
    
    const sapXepTheoLuotXem = () => {
        if (!Array.isArray(listsp)) return;
        
        const sx = [...listsp].sort((a, b) => {
            return b.luot_xem - a.luot_xem;
        });
        ganListSP(sx);
        setDaSapXep(true);
    };
    
    const huyBoClocVaSapXep = () => {
        ganListSP([...originalListsp]);
        setDaSapXep(false);
    };

    const xuli = (sanpham) => {
        if (!daDangNhap) {
            if (window.confirm("Đăng nhập để thêm sản phẩm vào giỏ hàng!")) {
                navigate('/login');
                return;
            }
        }
        
        // Format the product with proper structure for the cart
        const cartItem = {
            id_sp: sanpham.id,
            ten_sp: sanpham.ten_sp,
            gia: sanpham.gia,
            gia_km: sanpham.gia_km,
            hinh: sanpham.hinh,
            so_luong: 1
        };
        
        dispatch(themSP(cartItem));
        setThongBaoCart(true);
        setTimeout(() => {
            setThongBaoCart(false);
        }, 2000);
    };

    const themSoSanhVaChuyenTrang = (sanpham) => {
        if (danhSachSoSanh.length >= 3) {
            setThongBaoMaxSoSanh(true);
            setTimeout(() => setThongBaoMaxSoSanh(false), 2000);
            return;
        }
        dispatch(themVaoSoSanh(sanpham));
        setThongBaoSoSanh(true);
        setTimeout(() => {
            setThongBaoSoSanh(false);
            showCompareBox();
        }, 1000);
    };

    const clearCompare = () => {
        // Xóa tất cả sản phẩm khỏi Redux (giả sử có action xoaKhoiSoSanh)
        danhSachSoSanh.forEach(sp => dispatch(xoaKhoiSoSanh(sp.id)));
        setIsCompareBoxVisible(false);
        localStorage.setItem('isCompareBoxVisible', 'false');
    };

    const showCompareBox = () => {
        setIsCompareBoxVisible(true);
        localStorage.setItem('isCompareBoxVisible', 'true');
    };

    const handleCompareNow = () => {
        navigate('/so-sanh');
    };

    const handleScrollToTop = (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div>
            {thongBaoCart && (
                <div className="thongbao">
                    Sản phẩm đã được thêm vào giỏ hàng!
                </div>
            )}
            {thongBaoSoSanh && (
                <div className="thongbao">
                    Sản phẩm đã được thêm vào so sánh!
                </div>
            )}
            {thongBaoMaxSoSanh && (
                <div className="thongbao thongbao-error">
                    Bạn chỉ có thể so sánh tối đa 3 sản phẩm!
                </div>
            )}
            <div className="troVe"><a href="#header" onClick={handleScrollToTop}><i className="bi bi-arrow-up-short"></i></a></div>
            <div id="carouselExampleIndicators" className="carousel slide_con">
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>
            <div className="box_titile_Home">
                <div className="titile_SP">
                    <h2>SẢN PHẨM MỚI 2025!</h2>
                    <hr className="h_r"></hr>
                </div>
                <div className="box_chucnang_loc_home">
                    <label style={{ marginRight: '5px', padding: '5px', fontWeight: '700', fontSize: '15px' }}>Sắp xếp: </label>
                    <select style={{ width: '220px', padding: '3px', borderRadius: '2px', border: '1px solid gray', fontSize: '15px' }}
                        onChange={(e) => { 
                            const value = e.target.value;
                            if (value === '1') {
                                huyBoClocVaSapXep();
                            } else if (value === '2') { 
                                sapXepGiaTang(); 
                            } else if (value === '3') { 
                                sapXepGiaGiam(); 
                            } else if (value === '4') {
                                sapXepTheoLuotXem();
                            }
                        }}>
                        <option value={1}>Mặc định</option>
                        <option value={2}>Giá khuyến mãi thấp đến cao</option>
                        <option value={3}>Giá khuyến mãi cao đến thấp</option>
                        <option value={4}>Sản phẩm được quan tâm nhiều</option>
                    </select>
                </div>
            </div>
            <div className="tong_box_SP">
                {Array.isArray(listsp) && listsp.map((sp, i) => (
                    <div className="box_SP" key={i}>
                        {sp.phan_tram_gg && (
                            <div className="box_SP_khuyen_mai">
                                Giảm {sp.phan_tram_gg}%
                            </div>
                        )}
                        <div className="box_SP_anh">
                            <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>
                                <img src={sp.hinh} title={sp.ten_sp.toUpperCase()} alt={sp.ten_sp} />
                            </Link>
                        </div>
                        <div className="cart_icon" onClick={() => xuli(sp)}>
                            <i className="bi bi-bag-plus-fill"></i>
                        </div>
                        <div className="box_SP_tensp">
                            <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>{sp.ten_sp}</Link>
                        </div>
                        <div className="box_SP_RAM_SSD">
                            <div><button className="box_SP_RAM">RAM: {sp.ram}</button></div>
                            <div><button className="box_SP_SSD">SSD: {sp.dia_cung}</button></div>
                        </div>
                        <div className="box_SP_gia">
                            <div className="box_SP_gia_km" style={{color: '#ff0000', fontWeight: 'bold'}}>
                                {parseFloat(sp.gia_km).toLocaleString("vi")} VNĐ
                            </div>
                            <div className="box_SP_gia_goc" style={daSapXep ? {color: '#999'} : {}}>
                                <del>{parseFloat(sp.gia).toLocaleString("vi")} VNĐ</del>
                            </div>
                        </div>
                        <div className="box_SP_luot_xem"><p>Lượt xem: {sp.luot_xem}</p></div>
                        <div className="box_SP_icon">
                            <div className="box_SP_icon_star">
                                <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                                <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                                <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                                <div className="box_SP_icon_star_dam"><i className="bi bi-star-fill"></i></div>
                                <div className="box_SP_icon_star_nhat"><i className="bi bi-star-fill"></i></div>
                                <div className="box_SP_icon_star_dg"><p>(Đánh giá)</p></div>
                            </div>
                            <div className="so_sanh">
                                <button className="so_sanh_btn" onClick={() => themSoSanhVaChuyenTrang(sp)}>
                                    So sánh
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="carousel-inner" style={{ padding: '10px' }}>
                <div className="carousel-item active">
                    <img src={banner_n1} style={{ width: '1200px', height: '170px', borderRadius: '10px' }} className="d-block w-100" alt={banner_n1} />
                </div>
                <div className="carousel-item">
                    <img src={banner5} style={{ width: '1200px', height: '170px', borderRadius: '10px' }} className="d-block w-100" alt={banner5} />
                </div>
                <div className="carousel-item">
                    <img src={banner_n1} style={{ width: '1200px', height: '170px', borderRadius: '10px' }} className="d-block w-100" alt={banner_n1} />
                </div>
            </div>
            {isCompareBoxVisible && (
                <div className="stickcompare stickcompare_new cp-desktop spaceInDown">
                    <a href="javascript:;" onClick={clearCompare} className="clearall">
                        <i className="bi bi-x"></i>Thu gọn
                    </a>
                    <ul className="listcompare">
                        {danhSachSoSanh.map(sp => (
                            <li key={sp.id}>
                                <span className="remove-ic-compare" onClick={() => dispatch(xoaKhoiSoSanh(sp.id))}>
                                    <i className="bi bi-x"></i>
                                </span>
                                <img src={sp.hinh} alt={sp.ten_sp} />
                                <h3>{sp.ten_sp}</h3>
                                <div className="product-info-ss">
                                    <div>RAM: {sp.ram}</div>
                                    <div>SSD: {sp.dia_cung}</div>
                                    <div className="price">{parseFloat(sp.gia_km).toLocaleString("vi")}₫</div>
                                </div>
                            </li>
                        ))}
                        {danhSachSoSanh.length < 3 && (
                            <li className="formsg">
                                <div className="cp-plus cp-plus_new">
                                    <i className="bi bi-plus-lg"></i>
                                    <p>Thêm sản phẩm</p>
                                </div>
                            </li>
                        )}
                    </ul>
                    <div className="closecompare">
                        <a href="javascript:;" onClick={handleCompareNow} className="doss">
                            So sánh ngay
                        </a>
                        <a href="javascript:;" onClick={clearCompare} className="txtremoveall">
                            Xóa tất cả
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;