import { useSelector, useDispatch } from "react-redux";
import { xoaKhoiSoSanh } from "./compareSlice";
import { Link } from "react-router-dom";
import { useState } from "react";
import './main.css';
import './home_sosanh.css';
import './sosanh.css';
function SoSanh() {
    const dispatch = useDispatch();
    const danhSachSoSanh = useSelector((state) => state.compare?.danhSachSoSanh || []);
    const [showDifferencesOnly, setShowDifferencesOnly] = useState(false);

    // Danh sách các thông số cần so sánh
    const specsToCompare = [
        { label: "Tên sản phẩm", key: "ten_sp" },
        { label: "Giá", key: "gia" },
        { label: "Giá khuyến mãi", key: "gia_km" },
        { label: "RAM", key: "ram" },
        { label: "Ổ cứng", key: "dia_cung" },
        { label: "CPU", key: "cpu" },
        { label: "Card đồ họa", key: "card" },
        { label: "Màn hình", key: "man_hinh" },
        { label: "Pin", key: "pin" },
        { label: "Cân nặng", key: "can_nang" },
        { label: "Kích thước", key: "kich_thuoc" },
        { label: "Xuất xứ", key: "xuat_xu" },
        { label: "Năm ra mắt", key: "nam_ra_mat" }
    ];

    // Hàm kiểm tra xem thông số có khác biệt giữa các sản phẩm không
    const isSpecDifferent = (key) => {
        if (danhSachSoSanh.length < 2) return false;
        const values = danhSachSoSanh.map(sp => sp[key]?.toString() || "Không có thông tin");
        return !values.every((val, _, arr) => val === arr[0]);
    };

    // Hàm xử lý khi người dùng bật/tắt "Chỉ xem điểm khác biệt"
    const toggleDifferences = () => {
        setShowDifferencesOnly(!showDifferencesOnly);
    };

    // Hàm format giá tiền
    const formatPrice = (price) => {
        return price ? parseFloat(price).toLocaleString("vi-VN") + "₫" : "Không có thông tin";
    };

    // Hàm render sao đánh giá
    const renderStars = (rating = 5) => {
        return (
            <div className="vote-txt">
                {[...Array(5)].map((_, index) => (
                    <i key={index} className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`}></i>
                ))}
                <span>({rating} đánh giá)</span>
            </div>
        );
    };

    return (
        <div className="pro-compare_main">
            <h1 className="title-cp">So sánh sản phẩm</h1>

            {/* Thanh điều khiển */}
            <div className="box-detailcp">
                <div className="stick-df" onClick={toggleDifferences}>
                    <i className={`icon-tickbox bi ${showDifferencesOnly ? 'bi-check-square-fill' : 'bi-square'}`}></i>
                    <span>Chỉ xem điểm khác biệt</span>
                </div>
            </div>

            {/* Bảng so sánh */}
            <div className="compare-wrapper">
                <div className="compare-table">
                    {/* Hàng tiêu đề (sản phẩm) */}
                    <div className="compare-row compare-header">
                        <div className="compare-col compare-label"></div>
                        {danhSachSoSanh.map((sp) => (
                            <div key={sp.id} className="compare-col">
                                <div className="productitem-cp">
                                    <div className="deleteProduct" onClick={() => dispatch(xoaKhoiSoSanh(sp.id))}>
                                        <i className="bi bi-x"></i>
                                    </div>
                                    <Link to={`/dtdd/${sp.ten_sp.replace(/\s+/g, '-').toLowerCase()}`}>
                                        <div className="item-img">
                                            <img className="thumb" src={sp.hinh} alt={sp.ten_sp} />
                                        </div>
                                        <h3 className="productname-cp">{sp.ten_sp}</h3>
                                        <div className="price">{formatPrice(sp.gia_km)}</div>
                                        <div className="rating_Compare">
                                            {renderStars(5)}
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {danhSachSoSanh.length < 3 && (
                            <div className="compare-col">
                                <Link to="/" className="add-product">
                                    <i className="bi bi-plus-circle"></i>
                                    <span>Thêm sản phẩm</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Các hàng thông số */}
                    {specsToCompare.map((spec) => {
                        if (showDifferencesOnly && !isSpecDifferent(spec.key)) {
                            return null;
                        }

                        return (
                            <div key={spec.key} className="compare-row" data-spec={spec.key}>
                                <div className="compare-label">{spec.label}</div>
                                {danhSachSoSanh.map((sp) => (
                                    <div 
                                        key={sp.id} 
                                        className={`compare-col ${isSpecDifferent(spec.key) ? 'different' : ''}`}
                                    >
                                        <span data-price={spec.key.includes('gia')}>
                                            {spec.key.includes('gia') 
                                                ? formatPrice(sp[spec.key])
                                                : sp[spec.key] || "Không có thông tin"}
                                        </span>
                                    </div>
                                ))}
                                {danhSachSoSanh.length < 3 && <div className="compare-col"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Khi không có sản phẩm */}
            {danhSachSoSanh.length === 0 && (
                <div className="no-products">
                    <p>Chưa có sản phẩm nào để so sánh</p>
                    <Link to="/" className="add-product">
                        <i className="bi bi-plus-circle"></i>
                        <span>Thêm sản phẩm để so sánh</span>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default SoSanh;