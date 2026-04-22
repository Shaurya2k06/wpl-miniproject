import axios from "axios";
const API_KEY = (process.env.REACT_APP_KICKSDB_API_KEY || "").trim();
const kicksClient = axios.create({
  baseURL: "https://api.kicks.dev/v3/",
});

kicksClient.interceptors.request.use((config) => {
  if (!API_KEY) {
    console.warn("KicksDB API key is missing. Check REACT_APP_KICKSDB_API_KEY.");
    return config;
  }

  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${API_KEY}`;
  return config;
});

export const kicksDbApi = {
  getPricesFromStockX(query) {
    return kicksClient.get(`stockx/products?query=${encodeURIComponent(query)}`);
  },
  getPricesFromGOAT(query) {
    return kicksClient.get(`goat/products?query=${encodeURIComponent(query)}`);
  },
};
