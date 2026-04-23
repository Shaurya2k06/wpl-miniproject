import { authApi, setAuthToken } from "../api/api";

const SET_USER_DATA = "auth_reducer/SET_USER_DATA";
const SET_AUTH_ERROR = "auth_reducer/SET_AUTH_ERROR";
const LOGOUT = "auth_reducer/LOGOUT";

let initialState = {
  userId: null,
  email: null,
  role: null,
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
  setAuthToken(null);
  return { type: LOGOUT };
};

const persistSession = (token, user) => {
  localStorage.setItem(
    "sneakerShopSession",
    JSON.stringify({
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
    })
  );
};

export const loginTh =
  (email, password, expectedRole) => async (dispatch) => {
    try {
      dispatch(setAuthError(null));
      const { data } = await authApi.login({
        email,
        password,
        expectedRole,
      });
      const { token, user } = data;
      setAuthToken(token);
      persistSession(token, user);
      dispatch(setUserData(user.id, user.email, user.role));
    } catch (e) {
      const msg =
        e.response?.data?.error || "Invalid email or password";
      dispatch(setAuthError(msg));
    }
  };

export const registerTh = (data) => async (dispatch) => {
  try {
    dispatch(setAuthError(null));
    const { data: body } = await authApi.register(data);
    const { token, user } = body;
    setAuthToken(token);
    persistSession(token, user);
    dispatch(setUserData(user.id, user.email, user.role));
  } catch (e) {
    const msg = e.response?.data?.error || "Registration failed. Try again.";
    dispatch(setAuthError(msg));
  }
};

export const initializeSessionTh = () => async (dispatch) => {
  const raw = localStorage.getItem("sneakerShopSession");
  if (!raw) return;
  let session;
  try {
    session = JSON.parse(raw);
  } catch {
    localStorage.removeItem("sneakerShopSession");
    return;
  }
  if (!session?.token) {
    localStorage.removeItem("sneakerShopSession");
    return;
  }
  setAuthToken(session.token);
  try {
    const { data } = await authApi.me();
    dispatch(setUserData(data.id, data.email, data.role));
  } catch {
    dispatch(logout());
    setAuthToken(null);
  }
};

export default authReducer;
