import {
  deleteItemTh,
  getCartTh,
  setQuantinyTh,
} from "./../../../redux/cart_reducer";
import { connect } from "react-redux";
import Cart from "./Cart";
import { useEffect } from "react";

let CartContainer = ({ getCartTh, cartData, setQuantinyTh, deleteItemTh }) => {
  useEffect(() => {
    getCartTh();
  }, [getCartTh]);

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
  };
};

CartContainer = connect(mapStateToProps, {
  getCartTh,
  deleteItemTh,
  setQuantinyTh,
})(CartContainer);
export default CartContainer;
