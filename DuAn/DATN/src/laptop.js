import React, { useState, useEffect } from "react";
import HienSPTrongMotTrang from './HienSPTrongMotTrang'; 
import Danhmuc from "./danhmuc";
import { Link, useNavigate } from "react-router-dom";
import { themVaoSoSanh, xoaKhoiSoSanh } from './compareSlice';
import { useDispatch, useSelector } from 'react-redux';
import { themSP } from './cartSlice';
import './home_sosanh.css';
import './boxPro.css';
import './App.css';
import './pagination.css';
import './price-filter.css';

function Laptop() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const daDangNhap = useSelector(state => state.auth.daDangNhap);
    const [listsp, ganListSP] = useState([]);
    const [originalListsp, setOriginalListsp] = useState([]);
    const danhSachSoSanh = useSelector(state => state.compare.danhSachSoSanh);
    const [isCompareBoxVisible, setIsCompareBoxVisible] = useState(false);
    const [thongBao, setThongBao] = useState(false);
    const [daSapXep, setDaSapXep] = useState(false);
    const [loading, setLoading] = useState(true);

    // Enhanced price filter states
    const [priceRanges, setPriceRanges] = useState([
        { id: 'price-all', label: 'Tất cả mức giá', min: 0, max: Infinity, checked: true },
        { id: 'price-1', label: 'Dưới 10 triệu', min: 0, max: 10000000, checked: false },
        { id: 'price-2', label: '10 - 15 triệu', min: 10000000, max: 15000000, checked: false },
        { id: 'price-3', label: '15 - 20 triệu', min: 15000000, max: 20000000, checked: false },
        { id: 'price-4', label: '20 - 25 triệu', min: 20000000, max: 25000000, checked: false },
        { id: 'price-5', label: '25 - 30 triệu', min: 25000000, max: 30000000, checked: false },
        { id: 'price-6', label: 'Trên 30 triệu', min: 30000000, max: Infinity, checked: false }
    ]);
    
    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // Track active filter

    // Improved pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(12);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        fetch("http://localhost:3000/sp")
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                ganListSP(data);
                setOriginalListsp(data);
                setTotalPages(Math.ceil(data.length / productsPerPage));
            } else {
                ganListSP([]);
                setOriginalListsp([]);
                setTotalPages(1);
            }
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            ganListSP([]);
            setOriginalListsp([]);
            setTotalPages(1);
            setLoading(false);
        });
    }, [productsPerPage]);

    // Update displayed products when page or product list changes
    useEffect(() => {
        if (listsp.length > 0) {
            const indexOfLastProduct = currentPage * productsPerPage;
            const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
            setDisplayedProducts(listsp.slice(indexOfFirstProduct, indexOfLastProduct));
        } else {
            setDisplayedProducts([]);
        }
    }, [currentPage, listsp, productsPerPage]);

    // Reset to page 1 when sorting or filtering is applied
    useEffect(() => {
        if (daSapXep) {
            setCurrentPage(1);
        }
    }, [daSapXep]);

    useEffect(() => {
        const isVisible = localStorage.getItem('isCompareBoxVisible') === 'true';
        setIsCompareBoxVisible(isVisible);
    }, []);

    // Sorting functions
    const sapXepGiaTang = () => {
        if (!Array.isArray(listsp)) return;
        
        const sx = [...listsp].sort((a, b) => {
            const giaA = parseFloat(a.gia_km || a.gia);
            const giaB = parseFloat(b.gia_km || b.gia);
            return giaA - giaB;
        });
        ganListSP(sx);
        setDaSapXep(true);
        setCurrentPage(1);
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
        setCurrentPage(1);
    };
    
    const sapXepTheoLuotXem = () => {
        if (!Array.isArray(listsp)) return;
        
        const sx = [...listsp].sort((a, b) => {
            return b.luot_xem - a.luot_xem;
        });
        ganListSP(sx);
        setDaSapXep(true);
        setCurrentPage(1);
    };
    
    const huyBoClocVaSapXep = () => {
        ganListSP([...originalListsp]);
        setDaSapXep(false);
        setCurrentPage(1);
        setPriceRanges(priceRanges.map(r => ({
            ...r,
            checked: r.id === 'price-all'
        })));
        setActiveFilter('all');
        setMinPrice('');
        setMaxPrice('');
        setShowPriceFilter(false); // Also hide the panel when clearing filters
    };

    // Enhanced price filtering
    const locTheoGia = (min, max, filterId = '') => {
        const filtered = originalListsp.filter(sp => {
            const gia = parseFloat(sp.gia_km || sp.gia);
            return gia >= min && gia <= max;
        });
        ganListSP(filtered);
        setDaSapXep(true);
        setCurrentPage(1);
        setActiveFilter(filterId || 'custom');
        
        // Automatically hide the price filter panel after applying
        setShowPriceFilter(false);
    };

    // Other functionality
    const xuli = (sanpham) => {
        if (!daDangNhap) {
            if (window.confirm("Đăng nhập để thêm sản phẩm vào giỏ hàng!")) {
                navigate('/login');
                return;
            }
        }
        
        const cartItem = {
            id_sp: sanpham.id,
            ten_sp: sanpham.ten_sp,
            gia: sanpham.gia,
            gia_km: sanpham.gia_km,
            hinh: sanpham.hinh,
            so_luong: 1
        };
        
        dispatch(themSP(cartItem));
        setThongBao(true);
        setTimeout(() => {
            setThongBao(false);
        }, 2000);
    };

    const themSoSanhVaChuyenTrang = (sanpham) => {
        if (danhSachSoSanh.length >= 3) {
            alert("Bạn chỉ có thể so sánh tối đa 3 sản phẩm!");
            return;
        }
        dispatch(themVaoSoSanh(sanpham));
        setThongBao(true);
        setTimeout(() => {
            setThongBao(false);
            showCompareBox();
        }, 1000);
    };

    const clearCompare = () => {
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

    // Enhanced pagination handlers
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // Improved page number generation for pagination
    const renderPageNumbers = () => {
        let pagesToShow = [];
        
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pagesToShow.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pagesToShow = [1, 2, 3, 4, '...', totalPages];
            } else if (currentPage >= totalPages - 2) {
                pagesToShow = [1, '...', totalPages-3, totalPages-2, totalPages-1, totalPages];
            } else {
                pagesToShow = [1, '...', currentPage-1, currentPage, currentPage+1, '...', totalPages];
            }
        }
        
        return pagesToShow;
    };

    // Function to change the number of products per page
    const changeProductsPerPage = (e) => {
        const newPerPage = parseInt(e.target.value);
        setProductsPerPage(newPerPage);
        setCurrentPage(1);
        setTotalPages(Math.ceil(listsp.length / newPerPage));
    };

    // Toggle price filter and add class to container
    const togglePriceFilter = () => {
        setShowPriceFilter(!showPriceFilter);
    };

    return (
        <div className={`laptop-container ${showPriceFilter ? 'filter-panel-open' : ''}`}>
            {thongBao && (
                <div className="thongbao">
                    Sản phẩm đã được thêm vào so sánh!
                </div>
            )}
            <div><Danhmuc/></div>
            
            {/* Enhanced Filter Controls Container */}
            <div className="filter-controls-wrapper">
                <div className="filter-controls-container">
                    {/* Sorting Control */}
                    <div className="sorting-control">
                        <label>
                            <i className="bi bi-sort-down"></i> Sắp xếp:
                        </label>
                        <select 
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
                            }}
                        >
                            <option value={1}>Mặc định</option>
                            <option value={2}>Giá thấp đến cao</option>
                            <option value={3}>Giá cao đến thấp</option>
                            <option value={4}>Sản phẩm được quan tâm</option>
                        </select>
                    </div>

                    {/* Enhanced Price Filter Control */}
                    <div className="price-filter-control">
                        <button 
                            onClick={togglePriceFilter} 
                            className="price-filter-toggle"
                        >
                            <i className="bi bi-funnel"></i>
                            {showPriceFilter ? 'Ẩn bộ lọc' : 'Lọc theo giá'}
                        </button>
                    </div>

                    {/* Products per Page Selector */}
                    <div className="per-page-control">
                        <label>
                            <i className="bi bi-grid"></i> Hiển thị:
                        </label>
                        <select value={productsPerPage} onChange={changeProductsPerPage}>
                            <option value={8}>8 sản phẩm</option>
                            <option value={12}>12 sản phẩm</option>
                            <option value={24}>24 sản phẩm</option>
                            <option value={48}>48 sản phẩm</option>
                        </select>
                    </div>

                    {/* Results Counter */}
                    <div className="results-counter">
                        <span>{listsp.length} sản phẩm</span>
                    </div>
                </div>

                {/* Price Filter Panel */}
                {showPriceFilter && (
                    <div className="price-filter-panel">
                        <div className="price-filter-options">
                            <h4>Khoảng giá</h4>
                            <div className="price-range-buttons">
                                {priceRanges.map(range => (
                                    <button
                                        key={range.id}
                                        className={`price-range-button ${activeFilter === range.id ? 'active' : ''}`}
                                        onClick={() => {
                                            setPriceRanges(priceRanges.map(r => ({
                                                ...r,
                                                checked: r.id === range.id
                                            })));
                                            locTheoGia(range.min, range.max, range.id);
                                        }}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="custom-price-range">
                                <h4>Tùy chọn khoảng giá</h4>
                                <div className="price-input-group">
                                    <input
                                        type="number"
                                        placeholder="Giá từ"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                    />
                                    <span>đến</span>
                                    <input
                                        type="number"
                                        placeholder="Giá đến"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                    />
                                    <button 
                                        className="apply-price-filter"
                                        onClick={() => {
                                            const min = parseFloat(minPrice) || 0;
                                            const max = parseFloat(maxPrice) || Infinity;
                                            locTheoGia(min, max);
                                        }}
                                    >
                                        <i className="bi bi-check-lg"></i> Áp dụng
                                    </button>
                                </div>
                            </div>

                            {daSapXep && (
                                <button className="clear-filters" onClick={huyBoClocVaSapXep}>
                                    <i className="bi bi-x-circle"></i> Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Loading State */}
            {loading ? (
                <div className="products-loading">
                    <div className="spinner"></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : (
                <>
                    {/* Products Display */}
                    {displayedProducts.length > 0 ? (
                        <HienSPTrongMotTrang spTrongTrang={displayedProducts} />
                    ) : (
                        <div className="no-products-found">
                            <i className="bi bi-exclamation-circle"></i>
                            <h3>Không tìm thấy sản phẩm</h3>
                            <p>Không có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
                            <button onClick={huyBoClocVaSapXep}>Xóa bộ lọc</button>
                        </div>
                    )}
                </>
            )}
            
            {/* Enhanced Pagination Controls */}
            {totalPages > 1 && displayedProducts.length > 0 && (
                <div className="modern-pagination">
                    <div className="pagination-controls">
                        <button 
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="pagination-arrow"
                            aria-label="Previous page"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                        
                        <div className="page-numbers">
                            {renderPageNumbers().map((number, index) => (
                                number === '...' 
                                    ? <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                                    : <button
                                        key={number}
                                        onClick={() => paginate(number)}
                                        className={`page-number ${currentPage === number ? 'active' : ''}`}
                                        aria-label={`Page ${number}`}
                                        aria-current={currentPage === number ? "page" : null}
                                      >
                                        {number}
                                      </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="pagination-arrow"
                            aria-label="Next page"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                    
                    <div className="pagination-info">
                        <span>Trang {currentPage} / {totalPages}</span>
                        <span>Hiển thị {displayedProducts.length} trên tổng số {listsp.length} sản phẩm</span>
                    </div>
                </div>
            )}

            {/* Compare Box - Keep existing code */}
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
            
            {/* Back to top button */}
            <button 
                className="back-to-top" 
                onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-label="Back to top"
            >
                <i className="bi bi-arrow-up"></i>
            </button>
        </div>
    );
}

export default Laptop;