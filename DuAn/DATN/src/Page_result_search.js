import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./price-filter.css";
import PhanTrang from "./PhanTrang";

function TimKiem() {
    document.title = "Kết quả tìm kiếm";
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get("q") || "";
    
    // State management
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [sortOption, setSortOption] = useState("default");
    const [priceRange, setPriceRange] = useState("all");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    
    // Custom price range
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Fetch categories for filter
    useEffect(() => {
        fetch("http://localhost:3000/loaisp")
            .then(res => res.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => {
                console.error("Error fetching categories:", error);
            });
    }, []);

    // Fetch search results
    useEffect(() => {
        if (!query) {
            setSearchResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Cập nhật API endpoint để sử dụng endpoint tìm kiếm mới
        fetch(`http://localhost:3000/sp/search?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                // Không cần lọc theo tên nữa vì API đã xử lý
                let filteredData = [...data];
                
                // Filter by category if selected
                if (selectedCategory) {
                    filteredData = filteredData.filter(item => 
                        item.id_loai.toString() === selectedCategory
                    );
                }
                
                // Apply price filtering
                filteredData = applyPriceFilter(filteredData);
                
                // Apply sorting
                filteredData = applySorting(filteredData);
                
                setSearchResults(filteredData);
                setTotalItems(filteredData.length);
                setCurrentPage(1);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching search results:", error);
                setError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.");
                setLoading(false);
            });
    }, [query, selectedCategory, priceRange, minPrice, maxPrice, sortOption]);

    // Apply price filter function
    const applyPriceFilter = (data) => {
        switch(priceRange) {
            case "under-10m":
                return data.filter(item => parseFloat(item.gia) < 10000000);
            case "10m-15m":
                return data.filter(item => 
                    parseFloat(item.gia) >= 10000000 && 
                    parseFloat(item.gia) <= 15000000
                );
            case "15m-20m":
                return data.filter(item => 
                    parseFloat(item.gia) >= 15000000 && 
                    parseFloat(item.gia) <= 20000000
                );
            case "20m-30m":
                return data.filter(item => 
                    parseFloat(item.gia) >= 20000000 && 
                    parseFloat(item.gia) <= 30000000
                );
            case "over-30m":
                return data.filter(item => parseFloat(item.gia) > 30000000);
            case "custom":
                const min = minPrice ? parseFloat(minPrice) : 0;
                const max = maxPrice ? parseFloat(maxPrice) : Infinity;
                return data.filter(item => {
                    const price = parseFloat(item.gia);
                    return price >= min && price <= max;
                });
            default:
                return data;
        }
    };

    // Apply sorting function
    const applySorting = (data) => {
        switch(sortOption) {
            case "price-asc":
                return [...data].sort((a, b) => parseFloat(a.gia) - parseFloat(b.gia));
            case "price-desc":
                return [...data].sort((a, b) => parseFloat(b.gia) - parseFloat(a.gia));
            case "newest":
                return [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case "name-asc":
                return [...data].sort((a, b) => a.ten_sp.localeCompare(b.ten_sp));
            case "name-desc":
                return [...data].sort((a, b) => b.ten_sp.localeCompare(a.ten_sp));
            case "most-viewed":
                return [...data].sort((a, b) => parseFloat(b.luot_xem) - parseFloat(a.luot_xem));
            default:
                return data;
        }
    };

    // Handle price range change
    const handlePriceRangeChange = (value) => {
        setPriceRange(value);
        if (value !== "custom") {
            setMinPrice("");
            setMaxPrice("");
        }
    };

    // Handle custom price filter
    const handleCustomPriceSubmit = (e) => {
        e.preventDefault();
        if (minPrice || maxPrice) {
            setPriceRange("custom");
        }
    };

    // Handle per page change
    const handlePerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    // Handle pagination
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Calculate current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = searchResults.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Reset all filters
    const resetFilters = () => {
        setSelectedCategory("");
        setPriceRange("all");
        setMinPrice("");
        setMaxPrice("");
        setSortOption("default");
        setItemsPerPage(12);
    };

    // Update search query
    const handleSearchInputChange = (e) => {
        const newQuery = e.target.value;
        if (e.key === 'Enter' && newQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`);
        }
    };

    // Toggle filter panel on mobile
    const toggleFilterPanel = () => {
        setFilterPanelOpen(!filterPanelOpen);
    };

    // Format price
    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString("vi-VN") + " VNĐ";
    };

    // Scroll to top button handler
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <div className="laptop-container">
            {/* Search Header */}
            <div className="search-header">
                <h1>Kết quả tìm kiếm cho: "{query}"</h1>
                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm sản phẩm" 
                        defaultValue={query}
                        onKeyDown={handleSearchInputChange}
                    />
                </div>
            </div>

            {/* Toggle filter button for mobile */}
            <button className="filter-toggle-button" onClick={toggleFilterPanel}>
                <i className="bi bi-funnel"></i> Bộ lọc {filterPanelOpen ? "▲" : "▼"}
            </button>

            {/* Filter Panel */}
            <div className={`filter-panel ${filterPanelOpen ? 'filter-panel-open' : ''}`}>
                <div className="filter-section">
                    <h3>Danh mục</h3>
                    <div className="category-filter">
                        <div 
                            className={`category-option ${selectedCategory === "" ? "active" : ""}`}
                            onClick={() => setSelectedCategory("")}
                        >
                            Tất cả
                        </div>
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className={`category-option ${selectedCategory === cat.id.toString() ? "active" : ""}`}
                                onClick={() => setSelectedCategory(cat.id.toString())}
                            >
                                {cat.ten_loai}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="filter-section">
                    <h3>Mức giá</h3>
                    <div className="price-range-buttons">
                        <button 
                            className={`price-range-button ${priceRange === "all" ? "active" : ""}`} 
                            onClick={() => handlePriceRangeChange("all")}
                        >
                            Tất cả
                        </button>
                        <button 
                            className={`price-range-button ${priceRange === "under-10m" ? "active" : ""}`}
                            onClick={() => handlePriceRangeChange("under-10m")}
                        >
                            Dưới 10 triệu
                        </button>
                        <button 
                            className={`price-range-button ${priceRange === "10m-15m" ? "active" : ""}`}
                            onClick={() => handlePriceRangeChange("10m-15m")}
                        >
                            10 - 15 triệu
                        </button>
                        <button 
                            className={`price-range-button ${priceRange === "15m-20m" ? "active" : ""}`}
                            onClick={() => handlePriceRangeChange("15m-20m")}
                        >
                            15 - 20 triệu
                        </button>
                        <button 
                            className={`price-range-button ${priceRange === "20m-30m" ? "active" : ""}`}
                            onClick={() => handlePriceRangeChange("20m-30m")}
                        >
                            20 - 30 triệu
                        </button>
                        <button 
                            className={`price-range-button ${priceRange === "over-30m" ? "active" : ""}`}
                            onClick={() => handlePriceRangeChange("over-30m")}
                        >
                            Trên 30 triệu
                        </button>
                    </div>

                    <form className="custom-price-range" onSubmit={handleCustomPriceSubmit}>
                        <div className="price-inputs">
                            <input 
                                type="number" 
                                placeholder="Giá thấp nhất" 
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <span>-</span>
                            <input 
                                type="number" 
                                placeholder="Giá cao nhất" 
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="apply-price-button">Áp dụng</button>
                    </form>
                </div>

                <button className="reset-filters-button" onClick={resetFilters}>
                    <i className="bi bi-arrow-counterclockwise"></i> Đặt lại bộ lọc
                </button>
            </div>

            {/* Results Control */}
            <div className="filter-controls-container">
                <div className="results-counter">
                    Tìm thấy <strong>{totalItems}</strong> sản phẩm
                </div>

                <div className="filter-controls">
                    <div className="sorting-control">
                        <label>Sắp xếp:</label>
                        <select 
                            value={sortOption} 
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="default">Mặc định</option>
                            <option value="price-asc">Giá thấp đến cao</option>
                            <option value="price-desc">Giá cao đến thấp</option>
                            <option value="name-asc">Tên A-Z</option>
                            <option value="name-desc">Tên Z-A</option>
                            <option value="most-viewed">Xem nhiều nhất</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                    </div>

                    <div className="per-page-control">
                        <label>Hiển thị:</label>
                        <select 
                            value={itemsPerPage} 
                            onChange={handlePerPageChange}
                        >
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={36}>36</option>
                            <option value={48}>48</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {loading ? (
                <div className="products-loading">
                    <div className="spinner"></div>
                    <p>Đang tìm kiếm sản phẩm...</p>
                </div>
            ) : error ? (
                <div className="no-products-found">
                    <i className="bi bi-exclamation-triangle"></i>
                    <h3>Đã xảy ra lỗi</h3>
                    <p>{error}</p>
                </div>
            ) : searchResults.length === 0 ? (
                <div className="no-products-found">
                    <i className="bi bi-search"></i>
                    <h3>Không tìm thấy sản phẩm</h3>
                    <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{query}"</p>
                    <button onClick={resetFilters}>Xóa bộ lọc</button>
                </div>
            ) : (
                <>
                    <div className="HienSPTrongMotTrang">
                        <div className="tong_box_SP">
                            {currentItems.map((sp, i) => (
                                <div className="box_SP" key={i}>
                                    <div className="box_SP_anh">
                                        <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>
                                            <img src={sp.hinh} alt={sp.ten_sp} />
                                        </Link>
                                    </div>
                                    <div className="box_SP_tensp">
                                        <Link to={`/sanpham/${sp.id}/${sp.id_loai}`}>{sp.ten_sp}</Link>
                                    </div>
                                    <div className="box_SP_gia">
                                        <div className="box_SP_gia_km">
                                            {formatPrice(sp.gia_km || sp.gia)}
                                        </div>
                                        {sp.gia_km && (
                                            <div className="box_SP_gia_goc">
                                                <del>{formatPrice(sp.gia)}</del>
                                            </div>
                                        )}
                                    </div>
                                    <div className="box_SP_luot_xem">
                                        <p>Lượt xem: {sp.luot_xem}</p>
                                    </div>
                                    <div className="box_SP_icon">
                                        <div className="box_SP_icon_star">
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                            <i className="bi bi-star-fill"></i>
                                        </div>
                                        <div className="cart_icon">
                                            <i className="bi bi-bag-plus-fill"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-container">
                            <PhanTrang
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Back to top button */}
            <button className="back-to-top" onClick={scrollToTop}>
                <i className="bi bi-arrow-up"></i>
            </button>
        </div>
    );
}

export default TimKiem;