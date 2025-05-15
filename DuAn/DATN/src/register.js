import { Link, useNavigate } from 'react-router-dom';
import './register.css';
import React, { useRef, useState } from 'react';

function Register() {
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  document.title = "Đăng ký";

  const submitDuLieu = (e) => {
    e.preventDefault();

    if (!emailRef.current.value || !passwordRef.current.value || !confirmPasswordRef.current.value) {
      alert("Nhập đủ thông tin nhé bạn ơi");
      return;
    }

    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    const url = "http://localhost:3000/register";
    let tt = { 
      email: emailRef.current.value, 
      password: passwordRef.current.value 
    };
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
        if (data.success) {
          alert("Đăng ký thành công!");
          navigate('/login');
        }
      })
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Đăng ký</h1>
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
          <div className="input-group input-group-login">
            <label>Xác nhận mật khẩu</label>
            <div className="password-wrapper">
              <input 
                type={showConfirmPassword ? "text" : "password"}
                ref={confirmPasswordRef}
                placeholder="Nhập lại mật khẩu"
                required
              />
              <i 
                className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              ></i>
            </div>
          </div>
          <div className="options">
            <div className="remember-me">
              <input 
                type="checkbox" 
                id="terms"
                required
              />
              <label htmlFor="terms">Tôi đồng ý với điều khoản sử dụng</label>
            </div>
          </div>
          <button type="submit" className="login-btn">
            Đăng ký
          </button>
        </form>
        <div className="register">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default Register; 