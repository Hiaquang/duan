import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    listSP: []
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        themSP: (state, action) => {
            const newItem = action.payload;
            if (!newItem) {
                console.error('Invalid item:', newItem);
                return;
            }

            // Handle products with either 'id' or 'id_sp' property
            const productId = newItem.id_sp || newItem.id;
            if (!productId) {
                console.error('Invalid item - no id or id_sp:', newItem);
                return;
            }

            // Ensure product has so_luong property
            const itemQuantity = newItem.so_luong || 1;

            const existingItemIndex = state.listSP.findIndex(item =>
                String(item.id_sp) === String(productId)
            );

            if (existingItemIndex !== -1) {
                const currentQuantity = Number(state.listSP[existingItemIndex].so_luong);
                const newQuantity = Math.min(currentQuantity + Number(itemQuantity), 10);
                state.listSP[existingItemIndex].so_luong = newQuantity;
            } else {
                state.listSP.push({
                    ...newItem,
                    id_sp: String(productId),
                    so_luong: Math.min(Number(itemQuantity), 10)
                });
            }
        },
        suaSL: (state, param) => {
            const [id, so_luong] = param.payload;
            if (!id) {
                console.error('Invalid ID for quantity update:', id);
                return;
            }

            const index = state.listSP.findIndex(s => String(s.id_sp) === String(id));
            if (index !== -1) {
                state.listSP[index].so_luong = Math.min(Math.max(Number(so_luong), 1), 10);
            }
        },
        xoaSP: (state, action) => {
            const id = action.payload;
            const index = state.listSP.findIndex(s => String(s.id_sp) === String(id));
            if (index !== -1) {
                state.listSP.splice(index, 1);
            }
        },
        xoaGH: state => {
            state.listSP = [];
        }
    }
});

export const { themSP, suaSL, xoaSP, xoaGH } = cartSlice.actions;
export default cartSlice.reducer;