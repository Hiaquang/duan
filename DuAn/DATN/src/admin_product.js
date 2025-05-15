import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AdminProductSua from './admin_product_Sua';
import AdminProductThem from './admin_product_Them';
import './admin_css/admin_product.css';
import './admin_css/admin_common.css';
import { showNotification } from './components/NotificationContainer';
import AdminSidebar from './components/AdminSidebar';

function AdminProduct() {
    document.title = "Quản lý sản phẩm";
    const [adminListSP, setAdminListSP] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const { token } = useSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("http://localhost:3000/admin/sp", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    let msg = `Không thể lấy danh sách sản phẩm (HTTP ${response.status})`;
                    let backendMsg = "";
                    try {
                        const err = await response.json();
                        backendMsg = err.message || JSON.stringify(err);
                        msg += `\nChi tiết: ${backendMsg}`;
                        console.error("API error (JSON):", err);
                    } catch (e) {
                        const text = await response.text();
                        backendMsg = text;
                        msg += `\nChi tiết: ${text}`;
                        console.error("API error (not JSON):", text);
                    }
                    alert(msg);
                    throw new Error(msg);
                }
                const data = await response.json();
                setAdminListSP(data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách sản phẩm:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: error.message || 'Không thể lấy danh sách sản phẩm'
                });
            }
        };
        fetchProducts();
    }, [refresh, token]);

    const handleEdit = (product) => {
        setSelectedProduct(product);
        const modalElement = document.getElementById('exampleModal2');
        if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    };

    const handleFilterChange = (e) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1); // Reset về trang 1 khi lọc
    };

    const filteredProducts = adminListSP.filter(product => {
        const matchesSearch = product.ten_sp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.cpu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.ram.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.dia_cung.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === "" || product.id_loai.toString() === filterCategory;
        
        return matchesSearch && matchesCategory;
    });

    const xoaSP = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            try {
                const response = await fetch(`http://localhost:3000/admin/sp/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Lỗi khi xóa sản phẩm");
                }

                showNotification({
                    type: 'success',
                    title: 'Thành công',
                    message: 'Xóa sản phẩm thành công'
                });
                setRefresh(!refresh);
            } catch (error) {
                console.error("Lỗi khi xóa sản phẩm:", error);
                showNotification({
                    type: 'error',
                    title: 'Lỗi',
                    message: 'Không thể xóa sản phẩm'
                });
            }
        }
    };

    // Tính toán sản phẩm hiển thị cho trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <AdminSidebar />
            <div style={{ marginLeft: 250, padding: '2rem 1rem' }}>
                <div className="admin_page_header">
                    <h1>Quản lý sản phẩm</h1>
                    <Link to="/admin" style={{ fontSize: '1.5rem', color: '#333' }}>
                        <i className="bi bi-house-door-fill"></i>
                    </Link>
                </div>

                <div className="search-filter-bar">
                    <div className="search-box">
                        <i className="bi bi-search search-icon"></i>
                        <input 
                            type="text" 
                            className="form-control search-input" 
                            placeholder="Tìm kiếm sản phẩm..." 
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="filter-group">
                        <select 
                            className="form-select" 
                            value={filterCategory}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả danh mục</option>
                            <option value="1">Asus</option>
                            <option value="2">Acer</option>
                            <option value="3">Dell</option>
                            <option value="4">HP</option>
                            <option value="5">Lenovo</option>
                            <option value="6">MSI</option>
                        </select>
                    </div>
                </div>

                <button 
                    type="button" 
                    className="btn btn-primary mb-3"
                    data-bs-toggle="modal" 
                    data-bs-target="#exampleModal"
                >
                    Thêm sản phẩm mới
                </button>

                {filteredProducts.length === 0 ? (
                    <div className="alert alert-info">
                        Không tìm thấy sản phẩm nào
                    </div>
                ) : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Hình ảnh</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Giá</th>
                                    <th>Giá KM</th>
                                    <th>Loại</th>
                                    <th>Lượt xem</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            <img 
                                                src={product.hinh} 
                                                alt={product.ten_sp} 
                                                style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                            />
                                        </td>
                                        <td>{product.ten_sp}</td>
                                        <td>{product.gia?.toLocaleString('vi-VN')}đ</td>
                                        <td>{product.gia_km?.toLocaleString('vi-VN')}đ</td>
                                        <td>{product.id_loai}</td>
                                        <td>{product.luot_xem}</td>
                                        <td>
                                            <button 
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => handleEdit(product)}
                                            >
                                                Sửa
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => xoaSP(product.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pagination">
                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <button
                                        onClick={() => paginate(1)}
                                        disabled={currentPage === 1}
                                        className="pagination-button"
                                    >
                                        &laquo;
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => paginate(pageNumber)}
                                                    className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        } else if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                                        }
                                        return null;
                                    })}
                                    <button
                                        onClick={() => paginate(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="pagination-button"
                                    >
                                        &raquo;
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <AdminProductThem 
                    setRefresh={setRefresh} 
                    adminListSP={adminListSP}
                />

                {selectedProduct && (
                    <AdminProductSua
                        setRefresh={setRefresh}
                        selectedProduct={selectedProduct}
                    />
                )}
            </div>
        </div>
    );
}

export default AdminProduct;
