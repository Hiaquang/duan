import { configureStore } from "@reduxjs/toolkit";
import compareReducer from "./compareSlice";  
import authReducer from "./authSlice";  
import cartReducer from "./cartSlice";  

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        compare: compareReducer,  
    },
});

export default store;
