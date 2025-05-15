import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import './main.css';
import Footer from './footer';
import PageHome from './Page_Home';
import Menu from './Menu';
import GioiThieu from './Page_GioiThieu';
import ProductDetail from './Page_Product_Detail';
import ShowProductOneKind from './Page_Show_Product_Kind';
import NotFound from './NotFound';
import ShowCart from './showCart';
import ThanhToan from './ThanhToan';
import PayMent from './PayMent';
import CamOn from './camon';
import Profile from "./Profile";
import ThanhTimKiem from './thanhtiemkiem';
import Admin from './admin_dashboard';
import AdminProduct from './admin_product';
import AdminUser from './admin_user';
import AdminOrder from './admin_order';
import Auth from './auth';
import ForgotPassword from './ForgotPassword';
import HienSPTrongMotTrang from './HienSPTrongMotTrang';
import SoSanh from './SoSanh';
import UpdatePassword from './doi_pass';
import AdminCategory from './admin_category';
import laptop from './laptop';
import KhuyenMai from './KhuyenMai';
import NotificationContainer from './components/NotificationContainer';
import ProtectedRoute from './ProtectedRoute';
import TimKiem from './Page_result_search';
import { setAuthFromStorage } from './authSlice';
import AdminLayout from './AdminLayout';

function App() {
  const dispatch = useDispatch();
  const daDangNhap = useSelector(state => state.auth.daDangNhap);
  const [showHeaderFooter, setShowHeaderFooter] = useState(true);
  const location = useLocation();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Khôi phục token và userInfo từ localStorage khi app khởi động
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo) {
      dispatch(setAuthFromStorage({
        token,
        userInfo: JSON.parse(userInfo)
      }));
    }
    setIsAuthChecked(true);
  }, [dispatch]);

  useEffect(() => {
    if (['/admin', '/admin/product', '/admin/user', '/admin/order', '/admin/category', '/auth', '/forgot-password'].includes(location.pathname)) {
      setShowHeaderFooter(false);
    } else {
      setShowHeaderFooter(true);
    }
  }, [location]);

  if (!isAuthChecked) {
    return <div>Đang kiểm tra đăng nhập...</div>;
  }

  return React.createElement(
    'div',
    { className: 'container-fulid' },
    React.createElement(NotificationContainer, null),
    showHeaderFooter && React.createElement(
      'header',
      { id: 'header' },
      React.createElement(
        'nav',
        { id: 'navv' },
        React.createElement(
          'div',
          { className: 'top-bar' },
          React.createElement('span', null, 'HOTLINE: 0123456789'),
          React.createElement(
            'div',
            { className: 'top-links' },
            React.createElement('a', { href: '#' }, React.createElement('i', { className: 'fas fa-info-circle' }), ' Hướng dẫn mua hàng'),
            React.createElement('a', { href: '#' }, React.createElement('i', { className: 'fas fa-gift' }), ' Ưu đãi khách hàng'),
            React.createElement('a', { href: '#' }, React.createElement('i', { className: 'fas fa-phone' }), ' Thông tin liên hệ')
          )
        ),
        React.createElement(
          'div',
          { className: 'container1' },
          React.createElement(Menu, null)
        )
      )
      
    ),

    // Box tìm kiếm
    React.createElement(
      'div',
      {
        style: { marginTop: '5%', width: '50%', marginLeft: '25%' },
        className: 'modal fade',
        id: 'staticBackdrop',
        'data-bs-backdrop': 'static',
        'data-bs-keyboard': 'false',
        tabIndex: '-1',
        'aria-labelledby': 'staticBackdropLabel',
        'aria-hidden': 'true',
      },
      React.createElement(ThanhTimKiem, null)
    ),

    // Box giỏ hàng
    React.createElement(
      'div',
      {
        style: { zIndex: '2001' },
        className: 'offcanvas offcanvas-end',
        'data-bs-scroll': 'true',
        tabIndex: '-1',
        id: 'offcanvasWithBothOptions',
        'aria-labelledby': 'offcanvasWithBothOptionsLabel',
      },
      React.createElement(
        'div',
        { className: 'offcanvas-header' },
        React.createElement(
          'h5',
          { style: { fontWeight: '700' }, className: 'offcanvas-title', id: 'offcanvasWithBothOptionsLabel' },
          'Giỏ hàng'
        ),
        React.createElement('button', {
          type: 'button',
          className: 'btn-close',
          'data-bs-dismiss': 'offcanvas',
          'aria-label': 'Close',
        })
      ),
      React.createElement(
        'div',
        { className: 'offcanvas-body' },
        React.createElement(
          'li',
          { style: { listStyle: 'none' } },
          React.createElement(
            Link,
            { to: '/showcart' },
            React.createElement(
              'button',
              { className: 'btn btn-outline-info', 'data-bs-dismiss': 'offcanvas' },
              'Xem giỏ hàng'
            )
          )
        )
      )
    ),

    React.createElement(
      'main',
      null,
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { path: '/auth', element: React.createElement(Auth, null) }),
        React.createElement(Route, { path: '/forgot-password', element: React.createElement(ForgotPassword, null) }),
        React.createElement(Route, {
          path: '/gioithieu',
          element: daDangNhap ? React.createElement(GioiThieu, null) : React.createElement(Navigate, { to: '/auth' }),
        }),
        React.createElement(Route, { path: '/sanpham/:id/:id_loai', element: React.createElement(ProductDetail, null) }),
        React.createElement(Route, { path: '/loai/:id', element: React.createElement(ShowProductOneKind, null) }),
        React.createElement(Route, { path: '/profile/:userId', element: React.createElement(Profile, null) }),
        React.createElement(Route, { path: '/', element: React.createElement(PageHome, null) }),
        React.createElement(Route, { path: '/khuyen-mai', element: React.createElement(KhuyenMai, null) }),
        React.createElement(Route, { path: '/search', element: React.createElement(TimKiem, null) }),
        React.createElement(Route, { path: '*', element: React.createElement(NotFound, null) }),
        React.createElement(Route, { path: '/hien-thi-san-pham', element: React.createElement(HienSPTrongMotTrang, null) }),
        React.createElement(Route, { path: '/so-sanh', element: React.createElement(SoSanh, null) }),
        React.createElement(Route, { path: '/laptop', element: React.createElement(laptop, null) }),
        React.createElement(
          Route,
          { element: React.createElement(ProtectedRoute, { requiredRole: 0 }) },
          React.createElement(Route, { path: '/showcart', element: React.createElement(ShowCart, null) }),
          React.createElement(Route, { path: '/thanh-toan', element: React.createElement(ThanhToan, null) }),
          React.createElement(Route, { path: '/payment/:id/:tong_tien/:total_quantity', element: React.createElement(PayMent, null) }),
          React.createElement(Route, { path: '/thanks', element: React.createElement(CamOn, null) }),
          React.createElement(Route, { path: '/doimatkhau', element: React.createElement(UpdatePassword, null) }),
          React.createElement(Route, { path: '/profile/:userId', element: React.createElement(Profile, null) })
        ),
        React.createElement(
          Route,
          { element: React.createElement(ProtectedRoute, { requiredRole: 1 }) },
          React.createElement(Route, { element: React.createElement(AdminLayout) }),
          React.createElement(Route, { path: '/admin', element: React.createElement(Admin, null) }),
          React.createElement(Route, { path: '/admin/product', element: React.createElement(AdminProduct, null) }),
          React.createElement(Route, { path: '/admin/user', element: React.createElement(AdminUser, null) }),
          React.createElement(Route, { path: '/admin/order', element: React.createElement(AdminOrder, null) }),
          React.createElement(Route, { path: '/admin/category', element: React.createElement(AdminCategory, null) })
        )
      )
    ),


    
    showHeaderFooter && React.createElement(
      'footer',
      { className: 'footer' },
      React.createElement(Footer, null)
    )
  );

  return(
    <Routes>
      {/* Các route không yêu cầu phân quyền */}
      <Route path="/" element={<PageHome />} />
      <Route path="/gioithieu" element={<GioiThieu />} />
      <Route path="/sanpham/:id/:id_loai" element={<ProductDetail />} />
      <Route path="/search" element={<TimKiem />} />

      {/* Các route yêu cầu đăng nhập */}
      <Route element={<ProtectedRoute requiredRole={0} />}>
        <Route path="/showcart" element={<ShowCart />} />
        <Route path="/thanhtoan" element={<ThanhToan />} />
      </Route>

      {/* Các route chỉ dành cho admin */}
      <Route element={<ProtectedRoute requiredRole={1} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/product" element={<AdminProduct />} />
          <Route path="/admin/user" element={<AdminUser />} />
          <Route path="/admin/order" element={<AdminOrder />} />
          <Route path="/admin/category" element={<AdminCategory />} />
        </Route>
      </Route>

      {/* Route không tìm thấy */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App;