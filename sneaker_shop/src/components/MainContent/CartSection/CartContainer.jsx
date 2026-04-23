import {
  deleteItemTh,
  getCartTh,
  setQuantinyTh,
} from "./../../../redux/cart_reducer";
import { connect } from "react-redux";
import Cart from "./Cart";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

let CartContainer = ({ getCartTh, cartData, setQuantinyTh, deleteItemTh, isAuth, role }) => {
  useEffect(() => {
    getCartTh();
  }, [getCartTh, isAuth, role]);

  if (!isAuth) {
    return (
      <Navigate to="/login" replace state={{ from: { pathname: "/cart" } }} />
    );
  }

  if (role !== "user") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Cart
      cartData={cartData}
      setQuantinyTh={setQuantinyTh}
      deleteItem={deleteItemTh}
    />
  );
};

let mapStateToProps = (state) => {
  return {
    cartData: state.cart.cart,
    isAuth: state.auth.isAuth,
    role: state.auth.role,
  };
};

CartContainer = connect(mapStateToProps, {
  getCartTh,
  deleteItemTh,
  setQuantinyTh,
})(CartContainer);
export default CartContainer;
