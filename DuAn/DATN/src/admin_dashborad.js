// import { Link } from "react-router-dom";
// import { useDispatch, useSelector } from 'react-redux';
// import { thoat } from './authSlice';
// // import "./admin_css/admin.css";
// // import 'bootstrap/dist/css/bootstrap.min.css';
// import { useEffect, useState } from "react";

// function Admin() {
//     document.title="Quản lý Dashboard";
//     const user = useSelector(state => state.auth.user);
//     const dispatch = useDispatch();
//     const [totalProducts, setTotalProducts] = useState(0);
//     const [totalCategories, setTotalCategories] = useState(0);
//     const [totalUsers, setTotalUsers] = useState(0);
//     const [totalOrders, setTotalOrders] = useState(0);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // Lấy dữ liệu thống kê
//         Promise.all([
//             fetch("http://localhost:3000/admin/sp").then(res => res.json()),
//             fetch("http://localhost:3000/admin/category").then(res => res.json()),
//             fetch("http://localhost:3000/admin/users").then(res => res.json())
//         ])
//         .then(([products, categories, users]) => {
//             setTotalProducts(products.length || 0);
//             setTotalCategories(categories.length || 0);
//             setTotalUsers(users.length || 0);
//             // Giả định số đơn hàng
//             setTotalOrders(Math.floor(Math.random() * 100) + 50);
//             setLoading(false);
//         })
//         .catch(error => {
//             console.error("Error fetching dashboard data:", error);
//             setLoading(false);
//         });
//     }, []);

//     const Logout = () => {
//       if(window.confirm('Bạn muốn đăng xuất?')) {
//         dispatch(thoat());
//       }
//     };
    
//     return (
//         <div className="admin_product">
//             <aside className="admin_product_aside" >
//                 <div className="admin_product_aside_header">
//                         <div className="admin_product_aside_header_title_img">
//                                 <img src={user.hinh} alt={user.hinh} />
//                                 <h3>{user.name}</h3>
//                                 <hr className="hr"/>
//                         </div>
//                         <div className="admin_product_aside_header_menu">
//                                 <ul>
//                                         <li><Link to="/admin"><i className="fa-solid fa-layer-group"></i> Quản lý Dashboard</Link></li>
//                                         <li><Link to="/admin/category"><i className="bi bi-list-task"></i> Quản lý Danh mục</Link></li>
//                                         <li><Link to="/admin/product"><i className="fa-solid fa-tags"></i> Quản lý sản phẩm</Link></li>
//                                         <li><Link to="/admin/user"><i className="fa-solid fa-user"></i> Quản lý tài khoản</Link></li>
//                                         <li><Link to="/admin/order"><i className="fa-solid fa-pen-to-square"></i> Quản lí đơn hàng</Link></li> 
//                                 </ul>
//                         </div>
//                         <div className="admin_product_aside_header_logout"> 
//                               <p>Đăng xuất</p>
//                               <Link to="/#" onClick={Logout}><i className="fa-solid fa-right-from-bracket"></i></Link>
//                         </div>
//                 </div>
//             </aside>
//             <article className="admin_product_article">
//                 <div className="admin_product_article_header">
//                     <div className="admin_product_article_header_icon_logout">
//                         <Link to="/admin"><i className="bi bi-house-door-fill"></i></Link>
//                     </div>
//                 </div>
                
//                 {loading ? (
//                     <div className="text-center" style={{marginTop:'20%'}}>
//                         <div style={{color:'#149b9b',width:'80px',height:'80px',fontSize:"20px"}} className="spinner-border" role="status">
//                             <span className="visually-hidden">Loading...</span>
//                         </div>
//                         <div style={{marginTop:'20px'}}>Đang tải thông tin...</div>
//                     </div>
//                 ) : (
//                     <div className="admin_product_article_box_content">
//                         <div className="admin_product_article_box_content_title">
//                             <h2>Tổng quan hệ thống</h2>
//                         </div>
                        
//                         <div className="dashboard-stats">
//                             <div className="stat-card">
//                                 <div className="stat-card-icon">
//                                     <i className="fa-solid fa-tags"></i>
//                                 </div>
//                                 <div className="stat-card-info">
//                                     <h3>{totalProducts}</h3>
//                                     <p>Sản phẩm</p>
//                                 </div>
//                             </div>
                            
//                             <div className="stat-card">
//                                 <div className="stat-card-icon">
//                                     <i className="bi bi-list-task"></i>
//                                 </div>
//                                 <div className="stat-card-info">
//                                     <h3>{totalCategories}</h3>
//                                     <p>Danh mục</p>
//                                 </div>
//                             </div>
                            
//                             <div className="stat-card">
//                                 <div className="stat-card-icon">
//                                     <i className="fa-solid fa-user"></i>
//                                 </div>
//                                 <div className="stat-card-info">
//                                     <h3>{totalUsers}</h3>
//                                     <p>Người dùng</p>
//                                 </div>
//                             </div>
                            
//                             <div className="stat-card">
//                                 <div className="stat-card-icon">
//                                     <i className="fa-solid fa-pen-to-square"></i>
//                                 </div>
//                                 <div className="stat-card-info">
//                                     <h3>{totalOrders}</h3>
//                                     <p>Đơn hàng</p>
//                                 </div>
//                             </div>
//                         </div>
                        
//                         <div className="admin_product_article_box_content_title" style={{marginTop: '30px'}}>
//                             <h2>Hoạt động gần đây</h2>
//                         </div>
                        
//                         <div style={{backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px'}}>
//                             <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
//                                 <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#149b9b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px'}}>
//                                     <i className="fa-solid fa-plus" style={{color: 'white'}}></i>
//                                 </div>
//                                 <div>
//                                     <p style={{margin: '0', fontWeight: '500'}}>Sản phẩm mới được thêm vào</p>
//                                     <small style={{color: '#6c757d'}}>2 phút trước</small>
//                                 </div>
//                             </div>
                            
//                             <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
//                                 <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#17a2b8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px'}}>
//                                     <i className="fa-solid fa-user" style={{color: 'white'}}></i>
//                                 </div>
//                                 <div>
//                                     <p style={{margin: '0', fontWeight: '500'}}>Người dùng mới đăng ký</p>
//                                     <small style={{color: '#6c757d'}}>10 phút trước</small>
//                                 </div>
//                             </div>
                            
//                             <div style={{display: 'flex', alignItems: 'center', marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
//                                 <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#28a745', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px'}}>
//                                     <i className="fa-solid fa-pen-to-square" style={{color: 'white'}}></i>
//                                 </div>
//                                 <div>
//                                     <p style={{margin: '0', fontWeight: '500'}}>Đơn hàng mới được tạo</p>
//                                     <small style={{color: '#6c757d'}}>30 phút trước</small>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </article>
//         </div>
//     );
// }
// export default Admin;