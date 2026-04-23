import style from "./App.module.scss";
import { connect } from "react-redux";
import Header from "./components/Header/Header";
import Sneakers from "./components/MainContent/SneakersSection/Sneakers";
import Footer from "./components/Footer/Footer";
import Preloader from "./components/common/preloader/Preloader";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop";
import CartContainer from "./components/MainContent/CartSection/CartContainer";
import SneakerPageContainer from "./components/MainContent/SneakersSection/SneakersPage/SneakersPageContainer";
import MainContainer from "./components/MainContent/MainSection/MainContainer";
import FavoritesContainer from "./components/MainContent/FavoritesSection/FavoritesContainer";
import PlaceOrder from "./components/MainContent/CartSection/PlaceOrder/PlaceOrder";
import MyOrders from "./components/MainContent/OrdersSection/MyOrders";
import { useEffect } from "react";
import { initializeApp } from "./redux/app_reducer";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import AdminBoard from "./components/Admin/AdminBoard";

let App = ({ initializeApp, isInitialized }) => {
  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return isInitialized ? (
    <div className={style.appWrapper}>
      <Header />
      <main className={style.mainContent}>
        <ScrollToTop>
          <Routes>
            <Route exact path="/" element={<MainContainer />}></Route>
            <Route path="/sneakers" element={<Sneakers />} />
            <Route path="/sneakers/:id" element={<SneakerPageContainer />} />
            <Route path="/cart" element={<CartContainer />} />
            <Route path="/cart/place_order" element={<PlaceOrder />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/favorites" element={<FavoritesContainer />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminBoard />} />
            <Route path="*" element={<Preloader />} />
          </Routes>
        </ScrollToTop>
      </main>
      <Footer />
    </div>
  ) : (
    <Preloader />
  );
};

App = connect(
  (state) => {
    return { isInitialized: state.app.isInitialized };
  },
  {
    initializeApp,
  }
)(App);

export default App;
