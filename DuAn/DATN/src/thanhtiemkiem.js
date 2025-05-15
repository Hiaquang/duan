import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './thanhtiemkiem.css';

const ThanhTimKiem = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const searchRef = useRef(null);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setProducts([]);
      return;
    }

    // Debounce search
    const timer = setTimeout(() => {
      setLoading(true);
      // Sửa đổi URL API để thực hiện tìm kiếm linh hoạt hơn
      fetch(`http://localhost:3000/sp/search?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          // Không cần lọc lại, vì API đã trả về kết quả phù hợp
          setProducts(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const focusHandler = () => {
    setShowSuggestions(true);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      // Chuyển hướng đến trang kết quả tìm kiếm
      window.location.href = `/search-results?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div className="search-modal-container" ref={searchRef}>
      <div className="search-modal">
        <div className="search-modal-header">
          <div className="search-input-wrapper">
            <i className="bi bi-search search-icon"></i>
            <input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              aria-label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleSearch}
              onFocus={focusHandler}
              className="search-input"
            />
            {query && (
              <button 
                className="clear-search" 
                onClick={() => setQuery('')}
                aria-label="Clear search"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            )}
          </div>
          <button type="button" className="close-search-modal" data-bs-dismiss="modal" aria-label="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="search-modal-body">
          {loading ? (
            <div className="search-loading">
              <div className="spinner"></div>
              <p>Đang tìm kiếm...</p>
            </div>
          ) : query.length === 0 ? (
            <div className="search-empty-state">
              <i className="bi bi-search"></i>
              <p>Vui lòng nhập từ khóa sản phẩm!</p>
            </div>
          ) : products.length === 0 ? (
            <div className="search-no-results">
              <i className="bi bi-exclamation-circle"></i>
              <p>Không tìm thấy sản phẩm phù hợp với "{query}"</p>
              <small>Hãy thử tìm kiếm với từ khóa khác.</small>
            </div>
          ) : (
            <div className="search-results-container">
              <h3 className="results-heading">Kết quả tìm kiếm ({products.length})</h3>
              <div className="products-grid">
                {products.map((sp, i) => (
                  <div className="product-card" key={i}>
                    <Link to={`/sanpham/${sp.id}/${sp.id_loai}`} className="product-link" data-bs-dismiss="modal">
                      <div className="product-image-container">
                        <img src={sp.hinh} title={sp.ten_sp.toUpperCase()} alt={sp.ten_sp} className="product-image" />
                      </div>
                      <div className="product-details">
                        <h4 className="product-name">{sp.ten_sp}</h4>
                        <div className="product-price">
                          <span>{Number(sp.gia).toLocaleString("vi")} VNĐ</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {products.length > 6 && (
                <Link to={`/search-results?q=${encodeURIComponent(query)}`} className="view-all-results" data-bs-dismiss="modal">
                  Xem tất cả kết quả
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThanhTimKiem;
