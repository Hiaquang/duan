import { Link, useNavigate, useLocation } from 'react-router-dom';
import './login.css';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { dalogin } from './authSlice';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef();
  const passwordRef = useRef();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  document.title = "Đăng nhập";

  const submitDuLieu = (e) => {
    e.preventDefault();

    if (!emailRef.current.value || !passwordRef.current.value) {
      alert("Nhập đủ thông tin nhé bạn ơi");
      return;
    }

    const url = "http://localhost:3000/login";
    let tt = { email: emailRef.current.value, password: passwordRef.current.value };
    const opt = {
      method: "POST",
      body: JSON.stringify(tt),
      headers: { 'Content-Type': 'application/json' },
    };

    fetch(url, opt)
      .then((res) => res.json())
      .then((data) => {
        if (data.thongbao) {
          alert(data.thongbao);
        }
        if (data.token && data.userInfo) {
            dispatch(dalogin(data));
            localStorage.setItem("userId", data.userInfo.id);
            const from = location.state?.from?.pathname || '/';
            navigate(from);
        }
      })
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Đăng nhập</h1>
        <div className="social-buttons">
          <button className="social-btn google">
            <i className="fa-brands fa-google"></i>
          </button>
          <button className="social-btn facebook">
            <i className="fa-brands fa-facebook"></i>
          </button>
          <button className="social-btn apple">
            <i className="fa-brands fa-apple"></i>
          </button>
        </div>
        <div className="or">
          <div><hr /></div>
          <div className="text_or">Hoặc</div>
          <div><hr /></div>
        </div>
        <form onSubmit={submitDuLieu}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              ref={emailRef}
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          <div className="input-group input-group-login">
            <label>Mật khẩu</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"}
                ref={passwordRef}
                placeholder="Nhập mật khẩu"
                required
              />
              <i 
                className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
          </div>
          <div className="options">
            <div className="remember-me">
              <input 
                type="checkbox" 
                id="remember"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="remember">Hiển thị mật khẩu</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
          <button type="submit" className="login-btn">
            Đăng nhập
          </button>
        </form>
        <div className="register">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
