import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  daDangNhap: false,
  user: null,
  token: null,
  expiresIn: 0,
  role: null
};

export const authSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    thoat: (state) => {
      const staySignedIn = localStorage.getItem("staySignedIn") === "true";
      Object.assign(state, initialState);
      localStorage.removeItem("userId");
      if (!staySignedIn) {
        localStorage.removeItem("token");
      }
      localStorage.removeItem("userInfo");
      localStorage.removeItem("staySignedIn");
      console.log("Người dùng đã đăng xuất.");
    },
    dalogin: (state, action) => {
      const { token, expiresIn, userInfo } = action.payload || {};

      if (!token || !userInfo) {
        console.error("Lỗi đăng nhập: Thiếu thông tin từ server!");
        return;
      }

      state.token = token;
      state.expiresIn = expiresIn || 0;
      state.user = userInfo;
      state.role = userInfo.role !== undefined ? userInfo.role : null;
      state.daDangNhap = true;

      // Lưu vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      console.log("✅ Đã ghi nhận state đăng nhập:", state.user);
    },
    // Thêm action mới để khôi phục trạng thái từ localStorage
    setAuthFromStorage: (state, action) => {
      const { token, userInfo } = action.payload || {};
      
      if (token && userInfo) {
        state.token = token;
        state.user = userInfo;
        state.role = userInfo.role !== undefined ? userInfo.role : null;
        state.daDangNhap = true;
        state.expiresIn = 3600; // Giả sử thời gian hết hạn là 1 giờ
        
        console.log("✅ Đã khôi phục trạng thái đăng nhập từ localStorage:", userInfo.email);
      }
    },
  },
});

export const { dalogin, thoat, setAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;