import { createSlice } from '@reduxjs/toolkit';
import { fetchCart, updateCartItem, removeFromCart, clearCart, addToCart } from './cartActions';

const initialState = {
  listSP: [],
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add a manual reducer for direct cart manipulation if needed
    updateCartCount: (state, action) => {
      // This is a utility method that can be used to manually sync the cart state
      if (action.payload && Array.isArray(action.payload)) {
        state.listSP = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.listSP = action.payload.map(item => ({
          ...item,
          id_sp: String(item.id_sp)
        }));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedItem = action.payload;
        if (!updatedItem || !updatedItem.id_sp) {
          console.error('Invalid updated item received:', updatedItem);
          return;
        }
        const itemIndex = state.listSP.findIndex(item => 
          String(item.id_sp) === String(updatedItem.id_sp)
        );
        if (itemIndex !== -1) {
          state.listSP[itemIndex] = {
            ...state.listSP[itemIndex],
            ...updatedItem,
            id_sp: String(updatedItem.id_sp)
          };
        }
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Ensure we remove the item from the Redux state
        if (action.payload && action.payload.productId) {
          const productIdToRemove = String(action.payload.productId);
          state.listSP = state.listSP.filter(item => 
            String(item.id_sp) !== productIdToRemove
          );
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.listSP = [];
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const newItem = action.payload;
        
        if (!newItem || !newItem.id_sp) {
          console.error('Invalid new item received:', newItem);
          return;
        }

        const existingItemIndex = state.listSP.findIndex(item => 
          String(item.id_sp) === String(newItem.id_sp)
        );

        if (existingItemIndex !== -1) {
          state.listSP[existingItemIndex] = {
            ...state.listSP[existingItemIndex],
            ...newItem,
            id_sp: String(newItem.id_sp)
          };
        } else {
          state.listSP.push({
            ...newItem,
            id_sp: String(newItem.id_sp)
          });
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { updateCartCount } = cartSlice.actions;
export default cartSlice.reducer;