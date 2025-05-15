import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(`http://localhost:3000/cart/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
        throw new Error(errorData.message || 'Không thể tải giỏ hàng');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch Cart Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ userId, productId, quantity, price, discountPrice }, { rejectWithValue }) => {
    try {
      // Validate inputs
      if (!userId || !productId) {
        throw new Error('Missing userId or productId');
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      // Convert productId to number to ensure compatibility with backend
      const numericProductId = parseInt(productId, 10);
      if (isNaN(numericProductId)) {
        throw new Error('Invalid product ID format');
      }

      // First, check if the product exists in the cart
      const checkResponse = await fetch(`http://localhost:3000/cart/${userId}`);
      if (!checkResponse.ok) {
        throw new Error('Không thể kiểm tra giỏ hàng');
      }

      const cartItems = await checkResponse.json();
      const existingItem = cartItems.find(item => parseInt(item.id_sp) === numericProductId);

      // If product doesn't exist in cart, add it instead of updating
      if (!existingItem) {
        // Create the cart item data
        const cartItemData = {
          id_sp: numericProductId,
          id_user: userId,
          so_luong: quantity,
          gia: price || 0,
          gia_km: discountPrice || price || 0
        };

        // Add the item to the cart
        const addResponse = await fetch('http://localhost:3000/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cartItemData)
        });

        if (!addResponse.ok) {
          const errorData = await addResponse.json().catch(() => ({ message: 'Lỗi khi thêm vào giỏ hàng' }));
          throw new Error(errorData.message || 'Không thể thêm sản phẩm vào giỏ hàng');
        }

        const addedData = await addResponse.json();
        return {
          ...addedData,
          id_sp: String(productId),
          so_luong: quantity
        };
      }

      // If we get here, the product exists, so update it
      const response = await fetch(`http://localhost:3000/cart/${userId}/${numericProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          so_luong: quantity,
          gia: price || 0,
          gia_km: discountPrice || price || 0
        })
      });

      // If response is not ok, try to get error details from server
      if (!response.ok) {
        let errorMessage = 'Lỗi không xác định từ server';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Validate response data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response data from server');
      }

      // Return with guaranteed fields, maintaining string type for id_sp in frontend state
      return {
        ...data,
        id_sp: String(productId),
        so_luong: quantity
      };
    } catch (error) {
      console.error('Update cart error:', error);
      return rejectWithValue(error.message || 'Không thể cập nhật số lượng sản phẩm');
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  'cart/deleteCartItem',
  async ({ userId, productId }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');
      
      // Convert productId to number for backend API
      const numericProductId = parseInt(productId, 10);
      if (isNaN(numericProductId)) {
        throw new Error('Invalid product ID format');
      }

      console.log(`Deleting item from cart: userId=${userId}, productId=${numericProductId}`);

      const response = await fetch(`http://localhost:3000/cart/${userId}/${numericProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If response is 404, the item may have been deleted already or doesn't exist
      if (response.status === 404) {
        console.warn('Sản phẩm không tồn tại trong giỏ hàng hoặc đã bị xóa');
        // Return success anyway to update the UI
        return { userId, productId: String(productId) };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
        throw new Error(errorData.message || 'Không thể xóa sản phẩm');
      }

      // Ensure that we return the string version of productId to match state format
      return { userId, productId: String(productId) };
    } catch (error) {
      console.error('Delete cart item error:', error);
      return rejectWithValue(error.message || 'Lỗi khi xóa sản phẩm');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      const response = await fetch(`http://localhost:3000/cart/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
        throw new Error(errorData.message || 'Không thể xóa giỏ hàng');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Clear Cart Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, product, quantity = 1 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không tìm thấy token xác thực');

      // Validate product data
      if (!product || (!product.id && !product.id_sp)) {
        throw new Error('Invalid product data');
      }

      const productId = product.id || product.id_sp;
      // Convert to number for backend API
      const numericProductId = parseInt(productId, 10);
      if (isNaN(numericProductId)) {
        throw new Error('Invalid product ID format');
      }
      
      const cartItemData = {
        id_sp: numericProductId,
        id_user: userId,
        so_luong: Math.min(quantity, 10),
        gia: product.gia || 0,
        gia_km: product.gia_km || product.gia || 0,
        ten_sp: product.ten_sp,
        hinh: product.hinh
      };

      // Check if product exists in cart
      const checkResponse = await fetch(`http://localhost:3000/cart/${userId}`);
      if (!checkResponse.ok) {
        throw new Error('Không thể kiểm tra giỏ hàng');
      }

      const cartItems = await checkResponse.json();
      const existingItem = cartItems.find(item => parseInt(item.id_sp) === numericProductId);

      if (existingItem) {
        // Update existing item
        const newQuantity = Math.min((existingItem.so_luong || 0) + quantity, 10);
        
        const updateResponse = await fetch(`http://localhost:3000/cart/${userId}/${numericProductId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...cartItemData,
            so_luong: newQuantity
          })
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json().catch(() => ({ message: 'Lỗi khi cập nhật giỏ hàng' }));
          throw new Error(errorData.message || 'Không thể cập nhật số lượng sản phẩm');
        }

        const updatedData = await updateResponse.json();
        return {
          ...updatedData,
          id_sp: String(productId)
        };
      } else {
        // Add new item
        const addResponse = await fetch('http://localhost:3000/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cartItemData)
        });

        if (!addResponse.ok) {
          const errorData = await addResponse.json().catch(() => ({ message: 'Lỗi không xác định từ server' }));
          throw new Error(errorData.message || 'Không thể thêm vào giỏ hàng');
        }

        const addedData = await addResponse.json();
        return {
          ...addedData,
          ...cartItemData,
          id_sp: String(productId)
        };
      }
    } catch (error) {
      console.error('Add To Cart Error:', error);
      return rejectWithValue(error.message || 'Không thể thêm vào giỏ hàng');
    }
  }
);