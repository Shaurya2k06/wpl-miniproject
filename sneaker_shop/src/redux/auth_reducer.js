import { authApi } from "../api/api";

const SET_USER_DATA = "auth_reducer/SET_USER_DATA";
const SET_AUTH_ERROR = "auth_reducer/SET_AUTH_ERROR";
const LOGOUT = "auth_reducer/LOGOUT";

let initialState = {
  userId: null,
  email: null,
  role: null, // 'user' | 'owner'
  isAuth: false,
  authError: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_DATA:
      return {
        ...state,
        ...action.payload,
        isAuth: true,
        authError: null,
      };
    case SET_AUTH_ERROR:
      return {
        ...state,
        authError: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        userId: null,
        email: null,
        role: null,
        isAuth: false,
      };
    default:
      return state;
  }
};

export const setUserData = (userId, email, role) => ({
  type: SET_USER_DATA,
  payload: { userId, email, role },
});

export const setAuthError = (error) => ({
  type: SET_AUTH_ERROR,
  payload: error,
});

export const logout = () => {
  localStorage.removeItem("sneakerShopSession");
  return { type: LOGOUT };
};

// Helpers for Local Storage Registry
const getLocalUsers = () => {
    const users = localStorage.getItem("sneakerShopUserRegistry");
    return users ? JSON.parse(users) : [];
};

const saveLocalUser = (user) => {
    const users = getLocalUsers();
    const newUser = { ...user, id: Date.now().toString() };
    users.push(newUser);
    localStorage.setItem("sneakerShopUserRegistry", JSON.stringify(users));
    return newUser;
};

// Thunks
export const loginTh = (email, password) => async (dispatch) => {
  try {
    let user;
    try {
        const users = await authApi.getUsers();
        user = users.data.find((u) => u.email === email && u.password === password);
    } catch (e) {
        console.warn("MockAPI users endpoint not found, checking local storage...");
    }

    // Fallback to local storage if not found in API
    if (!user) {
        const localUsers = getLocalUsers();
        user = localUsers.find((u) => u.email === email && u.password === password);
    }

    if (user) {
      dispatch(setUserData(user.id, user.email, user.role));
      localStorage.setItem("sneakerShopSession", JSON.stringify({ userId: user.id, email: user.email, role: user.role }));
    } else {
      dispatch(setAuthError("Invalid email or password"));
    }
  } catch (error) {
    dispatch(setAuthError("Server error. Please try again later."));
  }
};

export const registerTh = (data) => async (dispatch) => {
  try {
    let newUser;
    try {
        const response = await authApi.register(data);
        newUser = response.data;
    } catch (e) {
        console.warn("MockAPI registration failed, falling back to local storage...");
        newUser = saveLocalUser(data);
    }

    dispatch(setUserData(newUser.id, newUser.email, newUser.role));
    localStorage.setItem("sneakerShopSession", JSON.stringify({ userId: newUser.id, email: newUser.email, role: newUser.role }));
  } catch (error) {
    dispatch(setAuthError("Registration failed. Try again."));
  }
};

export const initializeSessionTh = () => (dispatch) => {
  const session = localStorage.getItem("sneakerShopSession");
  if (session) {
    const { userId, email, role } = JSON.parse(session);
    dispatch(setUserData(userId, email, role));
  }
};

export default authReducer;
