import { cartApi, favoritesApi, ordersApi } from "./../api/api";

const GET_CART = "cart_reducer/GET_CART";
const GET_FAVORITES = "cart_reducer/GET_FAVORITES";
const ADD_TO_FAVORITE = "cart_reducer/ADD_TO_FAVORITE";

let initialState = {
  cart: null,
  favorites: null,
};

const getCart = (cartData) => ({
  type: GET_CART,
  cartData,
});

const getFavorites = (favoriteData) => ({
  type: GET_FAVORITES,
  favoriteData,
});

const addToFavorite = (newFavoriteItem) => ({
  type: ADD_TO_FAVORITE,
  newFavoriteItem,
});

export const getCartTh = () => async (dispatch, getState) => {
  const { auth } = getState();
  if (!auth.isAuth || auth.role !== "user") {
    dispatch(getCart([]));
    return;
  }
  try {
    let data = await cartApi.getCartOrder();
    dispatch(getCart(data.data));
  } catch {
    dispatch(getCart([]));
  }
};

export const deleteItemTh = (id) => async (dispatch, getState) => {
  const { auth } = getState();
  if (!auth.isAuth || auth.role !== "user") return;
  await cartApi.deleteFromCart(id);
  dispatch(getCartTh());
};

export const addToCartTh = (orderData) => async (dispatch, getState) => {
  const { auth } = getState();
  if (!auth.isAuth || auth.role !== "user") {
    window.alert(
      "Please sign in as a customer to add items to your cart."
    );
    return;
  }
  try {
    await cartApi.addToCart(orderData);
    dispatch(getCartTh());
  } catch (e) {
    const msg = e.response?.data?.error || "Could not add to cart";
    window.alert(msg);
  }
};

export const setQuantinyTh = (id, total) => async (dispatch, getState) => {
  const { auth } = getState();
  if (!auth.isAuth || auth.role !== "user") return;
  await cartApi.setItemQuantiny(id, total);
  dispatch(getCartTh());
};

export const placeOrderTh = (shipping) => async (dispatch, getState) => {
  const { auth } = getState();
  if (!auth.isAuth || auth.role !== "user") {
    throw new Error("Sign in as a customer to place an order.");
  }
  await ordersApi.create({ shipping });
  await dispatch(getCartTh());
};

export const getFavoritesTh = () => async (dispatch) => {
  let data = await favoritesApi.getFavorites();
  dispatch(getFavorites(data.data));
};

export const addFavoriteTh = (sneakerData) => async (dispatch) => {
  let addedItem = await favoritesApi.addFavorite(sneakerData);
  dispatch(addToFavorite(addedItem.data));
};

export const deleteFavoriteTh = (id) => async (dispatch) => {
  await favoritesApi.deleteFavorite(id);
  dispatch(getFavoritesTh());
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CART:
      return {
        ...state,
        cart: [...action.cartData],
      };
    case GET_FAVORITES:
      return {
        ...state,
        favorites: [...action.favoriteData],
      };
    case ADD_TO_FAVORITE:
      return {
        ...state,
        favorites: [...state.favorites, action.newFavoriteItem],
      };
    default:
      return state;
  }
};

export default cartReducer;
