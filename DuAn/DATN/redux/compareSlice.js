import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Lấy danh sách sản phẩm đang so sánh từ API
export const fetchCompareList = createAsyncThunk(
    "compare/fetchCompareList",
    async (id_user) => {
        const response = await axios.get(`http://localhost:3000/so-sanh/${id_user}`);
        return response.data;
    }
);

const compareSlice = createSlice({
    name: "compare",
    initialState: {
        items: [],
        status: "idle",
    },
    reducers: {
        addProductToCompare: (state, action) => {
            if (state.items.length < 4) {
                state.items.push(action.payload);
            }
        },
        removeProductFromCompare: (state, action) => {
            state.items = state.items.filter((sp) => sp.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCompareList.fulfilled, (state, action) => {
                state.items = action.payload;
            });
    },
});

export const { addProductToCompare, removeProductFromCompare } = compareSlice.actions;
export default compareSlice.reducer;
