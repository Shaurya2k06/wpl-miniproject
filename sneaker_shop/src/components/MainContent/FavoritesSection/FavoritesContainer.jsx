import Favorites from "./Favorites";
import { connect } from "react-redux";
import {
  getFavoritesTh,
  deleteFavoriteTh,
} from "./../../../redux/cart_reducer";
import { useEffect } from "react";

let FavoritesContainer = ({ getFavoritesTh, favorites, deleteFavoriteTh }) => {
  useEffect(() => {
    getFavoritesTh();
  }, [getFavoritesTh]);

  return (
    <Favorites
      favorites={favorites}
      deleteFavorite={deleteFavoriteTh}
    />
  );
};
let mapStateToProps = (state) => {
  return {
    favorites: state.cart.favorites,
  };
};

FavoritesContainer = connect(mapStateToProps, {
  getFavoritesTh,
  deleteFavoriteTh,
})(FavoritesContainer);

export default FavoritesContainer;
