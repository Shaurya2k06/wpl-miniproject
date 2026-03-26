import SneakersResult from "./SneakersResult";
import { useEffect } from "react";
import { connect } from "react-redux";
import { getSneakersTh } from "./../../../../redux/sneakers_reducer";
import {
  addFavoriteTh,
  deleteFavoriteTh,
} from "../../../../redux/cart_reducer";
import { filtersApi } from "./../../../common/FiltersApi/FiltersApi";
import loader from "../../../../img/preloader/loading.gif";

let SneakersResultContainer = ({ getSneakersTh, data, filtersData, favorites, addFavoriteTh, deleteFavoriteTh }) => {
  useEffect(() => {
    getSneakersTh();
  }, [getSneakersTh]);

  let newData =
    data && filtersApi.filterByBrand(filtersData.brand, data);
  newData = newData && filtersApi.filterByYear(filtersData.year, newData);
  newData = newData && filtersApi.filterBySize(filtersData.size, newData);
  newData =
    newData && filtersApi.filterByPrice(filtersData.price, newData);
  newData =
    newData && filtersApi.filterByModel(filtersData.model, newData);
  return (
    <div
      id="sneakerResultContainer"
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      {!!data !== false ? (
        <div style={{ height: "inherit" }}>
          <SneakersResult
            sneakersData={newData}
            favorites={favorites}
            addFavorite={addFavoriteTh}
            deleteFavorite={deleteFavoriteTh}
          />
        </div>
      ) : (
        <img
          src={loader}
          alt="loader"
          style={{
            position: window.innerWidth < 760 ? "relative" : "absolute",
            top: 0,
            left: 0,
            width: "300px",
            bottom: 0,
            right: 0,
            margin: "auto",
            display: "block",
          }}
        />
      )}
    </div>
  );
};
let mapStateToProps = (state) => {
  return {
    data: state.sneakers.allSneakers,
    favorites: state.cart.favorites,
  };
};

SneakersResultContainer = connect(mapStateToProps, {
  getSneakersTh,
  addFavoriteTh,
  deleteFavoriteTh,
})(SneakersResultContainer);

export default SneakersResultContainer;
