import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Thêm dòng này
import "./doi_pass.css"; 

const UpdatePassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate(); // Thêm dòng này

  const handleRequestToken = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3000/request-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi gửi mã xác thực");

      setSuccess("Mã xác thực đã gửi tới email.");
      setIsEmailSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token) {
      setError("Vui lòng nhập mã xác thực.");
      return;
    }
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    // Log payload để debug
    const payload = {
      email,
      token,
      password: newPassword,
      newPassword: newPassword,
      confirmPassword: newPassword,
    };
    console.log("Reset password payload:", payload);

    try {
      const res = await fetch("http://localhost:3000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        setError("Lỗi không xác định từ server: " + text);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        console.error("Reset password error:", data);
        setError(data.message || JSON.stringify(data) || `Lỗi: ${res.status} ${res.statusText}`);
        return;
      }

      setSuccess("Mật khẩu đặt lại thành công! Đăng nhập ngay.");
      setTimeout(() => {
        navigate("/auth"); // Chuyển hướng sang trang đăng nhập sau 1 giây
      }, 1000);
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="update-password-page">
      <div className="update-password-container">
        <h2>Đặt lại mật khẩu</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEmailSent}
          />
          <button onClick={handleRequestToken} disabled={loading || isEmailSent}>
            {loading ? "Đang gửi mã..." : "Gửi mã xác thực"}
          </button>
        </div>

        {isEmailSent && (
          <>
            <div className="form-group">
              <label>Mã xác thực (Token)</label>
              <input
                type="text"
                placeholder="Nhập mã xác nhận"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? "Đang đặt mật khẩu..." : "Đặt mật khẩu"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdatePassword;
