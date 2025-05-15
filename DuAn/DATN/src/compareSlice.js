import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    danhSachSoSanh: JSON.parse(localStorage.getItem("danhSachSoSanh")) || [],
};

const compareSlice = createSlice({
    name: "compare",
    initialState,
    reducers: {
        themVaoSoSanh: (state, action) => {
            // Kiểm tra sản phẩm đã tồn tại chưa (để tránh trùng lặp)
            const tonTai = state.danhSachSoSanh.find(sp => sp.id === action.payload.id);
            if (!tonTai) {
                state.danhSachSoSanh.push(action.payload);
                localStorage.setItem("danhSachSoSanh", JSON.stringify(state.danhSachSoSanh));
            }
        },
        xoaKhoiSoSanh: (state, action) => {
            state.danhSachSoSanh = state.danhSachSoSanh.filter(sp => sp.id !== action.payload);
            localStorage.setItem("danhSachSoSanh", JSON.stringify(state.danhSachSoSanh));
        }
    }
});


export const { themVaoSoSanh, xoaKhoiSoSanh } = compareSlice.actions;
export default compareSlice.reducer;
