import { getStaffPicsTh } from "./main_reducer";
import { getFavoritesTh } from "./cart_reducer";
import { initializeSessionTh } from "./auth_reducer";

const SET_INITIALIZED = "SET_INITIALIZED";

const initialState = {
  isInitialized: false,
};

export const setInitialized = () => ({
  type: SET_INITIALIZED,
});

export const initializeApp = () => async (dispatch) => {
  await dispatch(initializeSessionTh());
  await dispatch(getStaffPicsTh());
  await dispatch(getFavoritesTh());
  dispatch(setInitialized());
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_INITIALIZED:
      return {
        ...state,
        isInitialized: true,
      };

    default:
      return state;
  }
};

export default appReducer;
