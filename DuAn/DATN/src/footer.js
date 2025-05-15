import React from 'react';
import './footer.css';

function footer() {
    return(
      <footer>
        <div className="social-icons">
            <a href="#" className="social-icon"><i className="fa-brands fa-facebook"></i></a> 
            <a href="#" className="social-icon"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" className="social-icon"><i className="fa-brands fa-youtube"></i></a>
            <a href="#" className="social-icon"><i className="fa-brands fa-x-twitter"></i></a>
        </div>
        <hr></hr>
        <div className="footer-content">
            <div className="footer-section">
                <h3>Công Ty</h3>
                <ul>
                    <li><a href="#">Về Chúng Tôi</a></li>
                    <li><a href="#">Dịch Vụ Của Chúng Tôi</a></li>
                    <li><a href="#">Chính Sách Bảo Mật</a></li>
                    <li><a href="#">Chương Trình Liên Kết</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Hỗ Trợ</h3>
                <ul>
                    <li><a href="#">Câu Hỏi Thường Gặp</a></li>
                    <li><a href="#">Hoàn Trả</a></li>
                    <li><a href="#">Trạng Thái Đơn Hàng</a></li>
                    <li><a href="#">Cách Lựa Chọn Thanh Toán</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Cửa Hàng Trực Tuyến</h3>
                <ul>
                    <li><a href="#">Laptop</a></li>
                    <li><a href="#">Điện Thoại</a></li>
                    <li><a href="#">Đồng Hồ</a></li>
                    <li><a href="#">Phụ Kiện</a></li>
                </ul>
            </div>
            <div className="dmca-section">
                <img style={{ width: '100px', height: '100px' }} src="../logofinal.jpeg" alt="Logo" />
            </div>
        </div>
    </footer>
    )
};

export default footer;