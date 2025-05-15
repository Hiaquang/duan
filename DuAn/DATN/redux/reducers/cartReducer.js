const initialState = {
    items: []
};

export default function cartReducer(state = initialState, action) {
    switch (action.type) {
        case 'ADD_TO_CART':
            return {
                ...state,
                items: [...state.items, action.payload]
            };
        // Thêm các cases khác nếu cần
        default:
            return state;
    }
} 