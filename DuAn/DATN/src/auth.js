import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { dalogin } from "./authSlice";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const nameRef = useRef();
  const dispatch = useDispatch();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [error, setError] = useState("");

  document.title = isLoginMode
    ? "Đăng nhập - LaptopCenter"
    : "Đăng ký - LaptopCenter";

  const submitDuLieu = async (e) => {
    e.preventDefault();
    setError("");

    // Validate input
    if (!emailRef.current.value || !passwordRef.current.value) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    if (
      !isLoginMode &&
      passwordRef.current.value !== confirmPasswordRef.current.value
    ) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!isLoginMode && passwordRef.current.value.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      // Sửa URL API để khớp với server
      const url = isLoginMode
        ? "http://localhost:3000/login"
        : "http://localhost:3000/dangky";

      const data = {
        email: emailRef.current.value,
        password: passwordRef.current.value,
        name: !isLoginMode ? nameRef.current.value : undefined,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      // Kiểm tra response status
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.thongbao || "Có lỗi xảy ra");
        } catch (e) {
          throw new Error(errorText || "Có lỗi xảy ra");
        }
      }

      // Thử parse response text thành JSON
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Response text:", responseText);
        throw new Error("Server trả về dữ liệu không hợp lệ");
      }

      if (isLoginMode && result.token && result.userInfo) {
        dispatch(dalogin(result));
        localStorage.setItem("userId", result.userInfo.id);
        if (staySignedIn) {
          localStorage.setItem("token", result.token);
        }
        const from = location.state?.from?.pathname || "/";
        navigate(from);
      } else if (!isLoginMode && result.thongbao) {
        // Sau khi đăng ký thành công, tự động đăng nhập
        const loginResponse = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: emailRef.current.value,
            password: passwordRef.current.value,
          }),
        });

        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          dispatch(dalogin(loginResult));
          localStorage.setItem("userId", loginResult.userInfo.id);
          if (staySignedIn) {
            localStorage.setItem("token", loginResult.token);
          }
          setError("Đăng ký thành công! Đang chuyển hướng...");
          setTimeout(() => {
            const from = location.state?.from?.pathname || "/";
            navigate(from);
          }, 1000);
        } else {
          setError("Đăng ký thành công! Vui lòng đăng nhập.");
          setIsLoginMode(true);
        }
        // Clear form
        emailRef.current.value = "";
        passwordRef.current.value = "";
        if (confirmPasswordRef.current) {
          confirmPasswordRef.current.value = "";
        }
      } else {
        throw new Error(result.thongbao || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.message.includes("Failed to fetch")) {
        setError(
          "Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối."
        );
      } else if (error.message.includes("Server trả về")) {
        setError("Server đang gặp vấn đề. Vui lòng thử lại sau.");
      } else {
        const errorData =
          typeof error.message === "string"
            ? JSON.parse(error.message)
            : error.message;
        setError(errorData.thongbao || "Đã xảy ra lỗi, vui lòng thử lại sau");

        // setError(error.message || "Đã xảy ra lỗi, vui lòng thử lại sau");
      }
    }
  };

  // Inline styles
  const styles = {
    container: {
      background: "#f5f5f5",
      width: "100%",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
    },
    box: {
      background: "#fff",
      borderRadius: "8px",
      padding: "40px 30px",
      width: "100%",
      maxWidth: "380px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      textAlign: "center",
    },
    logo: {
      fontSize: "40px",
      color: "#000",
      marginBottom: "20px",
    },
    title: {
      fontSize: "24px",
      marginBottom: "10px",
      color: "#000",
      fontWeight: 600,
    },
    subtitle: {
      color: "#6e6e73",
      fontSize: "14px",
      marginBottom: "25px",
    },
    inputGroup: {
      marginBottom: "15px",
    },
    input: {
      width: "100%",
      padding: "12px 15px",
      border: "1px solid #d2d2d7",
      borderRadius: "6px",
      fontSize: "16px",
      background: "#fff",
      boxSizing: "border-box",
    },
    error: {
      color: "#ff3b30",
      fontSize: "14px",
      marginBottom: "15px",
      textAlign: "center",
    },
    options: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      margin: "20px 0",
      fontSize: "14px",
      width: "100%",
      padding: "0 5px",
    },
    staySignedIn: {
      display: "flex",
      alignItems: "center",
    },
    checkbox: {
      marginRight: "8px",
      width: "16px",
      height: "16px",
    },
    label: {
      color: "#1d1d1f",
      cursor: "pointer",
      fontSize: "14px",
    },
    forgotPassword: {
      color: "#0071e3",
      textDecoration: "none",
      fontSize: "14px",
    },
    loginBtn: {
      width: "100%",
      padding: "12px",
      background: "#0071e3",
      border: "none",
      borderRadius: "6px",
      color: "#fff",
      fontSize: "16px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    loginBtnHover: {
      backgroundColor: "#0077ed",
    },
    register: {
      marginTop: "25px",
      fontSize: "14px",
      color: "#6e6e73",
    },
    link: {
      color: "#0071e3",
      textDecoration: "none",
      cursor: "pointer",
    },
  };

  return React.createElement(
    "div",
    { style: styles.container },
    React.createElement(
      "div",
      { style: styles.box },
      React.createElement(
        "div",
        { style: styles.logo },
        React.createElement("i", { className: "bi bi-laptop" })
      ),
      React.createElement(
        "h1",
        { style: styles.title },
        isLoginMode ? "Đăng nhập" : "Đăng ký"
      ),
      React.createElement(
        "p",
        { style: styles.subtitle },
        isLoginMode
          ? "Đăng nhập để mua sắm tại LaptopCenter"
          : "Tạo tài khoản để mua sắm tại LaptopCenter"
      ),
      error && React.createElement("div", { style: styles.error }, error),
      React.createElement(
        "form",
        { onSubmit: submitDuLieu },
        !isLoginMode &&
          React.createElement(
            "div",
            { style: styles.inputGroup },
            React.createElement("input", {
              type: "text",
              id: "name",
              ref: nameRef,
              placeholder: "Họ và tên",
              required: true,
              autoComplete: "name",
              style: styles.input,
            })
          ),
        React.createElement(
          "div",
          { style: styles.inputGroup },
          React.createElement("input", {
            type: "email",
            id: "email",
            ref: emailRef,
            placeholder: "Email",
            required: true,
            autoComplete: "email",
            style: styles.input,
          })
        ),
        React.createElement(
          "div",
          { style: styles.inputGroup },
          React.createElement("input", {
            type: "password",
            id: "password",
            ref: passwordRef,
            placeholder: "Mật khẩu",
            required: true,
            autoComplete: "current-password",
            style: styles.input,
          })
        ),
        !isLoginMode &&
          React.createElement(
            "div",
            { style: styles.inputGroup },
            React.createElement("input", {
              type: "password",
              id: "confirm-password",
              ref: confirmPasswordRef,
              placeholder: "Xác nhận mật khẩu",
              required: true,
              style: styles.input,
            })
          ),
        isLoginMode
          ? React.createElement(
              "div",
              { style: styles.options },
              React.createElement(
                "div",
                { style: styles.staySignedIn },
                React.createElement("input", {
                  type: "checkbox",
                  id: "stay-signed-in",
                  checked: staySignedIn,
                  onChange: () => setStaySignedIn(!staySignedIn),
                  style: styles.checkbox,
                }),
                React.createElement(
                  "label",
                  { htmlFor: "stay-signed-in", style: styles.label },
                  "Duy trì đăng nhập"
                )
              ),
              React.createElement(
                Link,
                { to: "/forgot-password", style: styles.forgotPassword },
                "Quên mật khẩu?"
              )
            )
          : React.createElement(
              "div",
              { style: styles.options },
              React.createElement(
                "div",
                { style: styles.staySignedIn },
                React.createElement("input", {
                  type: "checkbox",
                  id: "terms",
                  required: true,
                  style: styles.checkbox,
                }),
                React.createElement(
                  "label",
                  { htmlFor: "terms", style: styles.label },
                  "Tôi đồng ý với điều khoản sử dụng"
                )
              )
            ),
        React.createElement(
          "button",
          {
            type: "submit",
            style: { ...styles.loginBtn, ...styles.loginBtnHover },
            onMouseEnter: (e) => (e.target.style.backgroundColor = "#0077ed"),
            onMouseLeave: (e) => (e.target.style.backgroundColor = "#0071e3"),
          },
          isLoginMode ? "Đăng nhập" : "Đăng ký"
        )
      ),
      React.createElement(
        "div",
        { style: styles.register },
        React.createElement(
          "p",
          null,
          isLoginMode ? "Chưa có tài khoản? " : "Đã có tài khoản? ",
          React.createElement(
            "span",
            {
              onClick: () => {
                setIsLoginMode(!isLoginMode);
                setError("");
              },
              style: styles.link,
            },
            isLoginMode ? "Tạo tài khoản mới" : "Đăng nhập ngay"
          )
        )
      )
    )
  );
}

export default Auth;
