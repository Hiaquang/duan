import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { themSP } from './cartSlice';
import './KhuyenMai.css';

function KhuyenMai() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log('Component mounted, fetching promotions...');
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            console.log('Fetching from API...');
            const response = await fetch('http://localhost:3000/khuyen-mai');
            console.log('API Response:', response);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            setPromotions(data);
        } catch (err) {
            console.error('Error fetching promotions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const themVaoGio = (sanpham) => {
        dispatch(themSP(sanpham));
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    };

    if (loading) {
        console.log('Loading state...');
        return <div className="loading">Đang tải...</div>;
    }
    
    if (error) {
        console.log('Error state:', error);
        return <div className="error">{error}</div>;
    }

    console.log('Rendering promotions:', promotions);

    return (
        <div className="khuyen-mai-container">
            <h1 className="khuyen-mai-title">Chương Trình Khuyến Mãi</h1>
            
            {promotions.length === 0 ? (
                <div className="no-promotions">
                    <p>Hiện tại không có chương trình khuyến mãi nào.</p>
                </div>
            ) : (
                <div className="promotions-grid">
                    {promotions.map((km) => (
                        <div key={km.id} className="promotion-card">
                            <div className="promotion-header">
                                <img 
                                    src={`http://localhost:3000/uploads/${km.hinh_anh}`} 
                                    alt={km.ten_km} 
                                    className="promotion-image"
                                    onError={(e) => {
                                        console.error('Image load error:', e);
                                        e.target.src = 'fallback-image.jpg';
                                    }}
                                />
                                <div className="promotion-badge">
                                    Giảm {km.phan_tram_km}%
                                </div>
                            </div>
                            
                            <div className="promotion-content">
                                <h2>{km.ten_km}</h2>
                                <p className="promotion-description">{km.mo_ta}</p>
                                
                                <div className="promotion-dates">
                                    <p>
                                        <i className="bi bi-calendar-check"></i>
                                        Bắt đầu: {new Date(km.ngay_bat_dau).toLocaleDateString()}
                                    </p>
                                    <p>
                                        <i className="bi bi-calendar-x"></i>
                                        Kết thúc: {new Date(km.ngay_ket_thuc).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="promotion-products">
                                    <h3>Sản phẩm áp dụng</h3>
                                    <div className="products-grid">
                                        {km.san_pham && km.san_pham.map((sp) => (
                                            <div key={sp.id} className="product-card">
                                                <img 
                                                    src={`http://localhost:3000/uploads/${sp.hinh}`} 
                                                    alt={sp.ten_sp} 
                                                    className="product-image"
                                                    onError={(e) => {
                                                        console.error('Product image load error:', e);
                                                        e.target.src = 'fallback-product-image.jpg';
                                                    }}
                                                />
                                                <h4>{sp.ten_sp}</h4>
                                                <div className="product-price">
                                                    <span className="original-price">
                                                        {sp.gia.toLocaleString()} VND
                                                    </span>
                                                    <span className="discounted-price">
                                                        {sp.gia_km.toLocaleString()} VND
                                                    </span>
                                                </div>
                                                <button 
                                                    className="add-to-cart-btn"
                                                    onClick={() => themVaoGio(sp)}
                                                >
                                                    Thêm vào giỏ hàng
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default KhuyenMai; 