import axios from "axios";
const API_KEY = process.env.REACT_APP_KICKSDB_API_KEY || "";
const kicksClient = axios.create({
  baseURL: "https://api.kicks.dev/v3/",
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

export const kicksDbApi = {
  getPricesFromStockX(query) {
    return kicksClient.get(`stockx/products?query=${encodeURIComponent(query)}`);
  },
  getPricesFromGOAT(query) {
    return kicksClient.get(`goat/products?query=${encodeURIComponent(query)}`);
  },
};
