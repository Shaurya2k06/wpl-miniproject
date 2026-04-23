import axios from "axios";

const backendBase =
  (process.env.REACT_APP_API_URL || "http://localhost:4000").replace(/\/$/, "");

export const backendApi = axios.create({
  baseURL: `${backendBase}/api`,
});

export function setAuthToken(token) {
  if (token) {
    backendApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete backendApi.defaults.headers.common.Authorization;
  }
}

const instance = axios.create({
  baseURL: "https://63bd839d18bc301c026b31a9.mockapi.io/",
});

const mainInstance = axios.create({
  baseURL: "https://63e0f6da59bb472a742d31c4.mockapi.io/",
});

export const sneakersApi = {
  getAllSneakers() {
    return instance.get("sneakersData");
  },
};

export const cartApi = {
  getCartOrder() {
    return backendApi.get("/cart");
  },

  addToCart(order) {
    return backendApi.post("/cart", order);
  },

  setItemQuantiny(id, total) {
    return backendApi.put("cart/" + id, total);
  },

  deleteFromCart(id) {
    return backendApi.delete("cart/" + id);
  },
};

export const mainApi = {
  getStaffPics() {
    return mainInstance.get("mainStaffPics");
  },
};

export const favoritesApi = {
  getFavorites() {
    return mainInstance.get("favorites");
  },
  addFavorite(data) {
    return mainInstance.post("favorites", data);
  },
  deleteFavorite(id) {
    return mainInstance.delete("favorites/" + id);
  },
};

export const authApi = {
  login(body) {
    return backendApi.post("/auth/login", body);
  },
  register(data) {
    return backendApi.post("/auth/register", data);
  },
  me() {
    return backendApi.get("/auth/me");
  },
};

export const adminApi = {
  stats() {
    return backendApi.get("/admin/stats");
  },
};

export const ordersApi = {
  list() {
    return backendApi.get("/orders");
  },
  create(body) {
    return backendApi.post("/orders", body);
  },
};
