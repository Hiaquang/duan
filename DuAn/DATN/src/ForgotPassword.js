import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const navigate = useNavigate();

  const handleRequestToken = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi gửi mã xác nhận!");

      setSuccess("Mã xác nhận đã được gửi đến email.");
      setIsEmailSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:3000/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Mã xác nhận không hợp lệ!");

      setSuccess("Mã xác nhận hợp lệ. Nhập mật khẩu mới.");
      setIsTokenValid(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

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

      setSuccess("Mật khẩu đặt lại thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgot-password-page">
      <div className="forgot-password-container">
        <h2>Quên Mật Khẩu</h2>
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
            {loading ? "Đang gửi mã..." : "Gửi mã xác nhận"}
          </button>
        </div>

        {isEmailSent && (
          <div className="form-group">
            <label>Mã xác nhận (Token)</label>
            <input
              type="text"
              placeholder="Nhập mã xác nhận"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              disabled={isTokenValid}
            />
            <button onClick={handleVerifyToken} disabled={loading || isTokenValid}>
              {loading ? "Đang xác thực..." : "Xác nhận"}
            </button>
          </div>
        )}

        {isTokenValid && (
          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button onClick={handleResetPassword} disabled={loading}>
              {loading ? "Đang đặt mật khẩu..." : "Đặt mật khẩu"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
