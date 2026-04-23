import style from "./PlaceOrder.module.scss";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { validation } from "./../../../../assets/validationInput/validation";
import { connect } from "react-redux";
import Preloader from "../../../common/preloader/Preloader";
import { placeOrderTh, getCartTh } from "../../../../redux/cart_reducer";

let PlaceOrder = ({
  isAuth,
  role,
  cartData,
  placeOrderTh,
  getCartTh,
}) => {
  let [email, changeEmail] = useState("");
  let [name, changeName] = useState("");
  let [address, changeAddress] = useState("");
  let [city, changeCity] = useState("");
  let [zip, changeZip] = useState("");
  let [telephone, changeTelephone] = useState("");
  let [isOrderSuccesed, setOrderSuccesed] = useState(false);
  let [submitting, setSubmitting] = useState(false);
  let [submitError, setSubmitError] = useState(null);

  let [inputError, setInputError] = useState({
    email: null,
    name: null,
    address: null,
    city: null,
    zip: null,
    telephone: null,
  });

  useEffect(() => {
    getCartTh();
  }, [getCartTh]);

  useEffect(() => {
    setInputError({
      email: null,
      name: null,
      address: null,
      city: null,
      zip: null,
      telephone: null,
    });
  }, [email, telephone, zip, name, address, city]);

  const { t } = useTranslation();

  if (!isAuth) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: { pathname: "/cart/place_order" } }}
      />
    );
  }

  if (role !== "user") {
    return <Navigate to="/admin" replace />;
  }

  if (cartData === null) {
    return <Preloader />;
  }

  if (!isOrderSuccesed && Array.isArray(cartData) && cartData.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  let handleSubmit = async (e) => {
    e.preventDefault();
    let emailVal = e.target.email.value;
    let nameVal = e.target.name.value;
    let addressVal = e.target.address.value;
    let cityVal = e.target.city.value;
    let zipVal = e.target.zip.value;
    let telephoneVal = e.target.telephone.value;

    setSubmitError(null);
    validation.email(emailVal, setInputError);
    validation.name(nameVal, setInputError);
    validation.address(addressVal, setInputError);
    validation.city(cityVal, setInputError);
    validation.zip(zipVal, setInputError);
    telephoneVal && validation.telephone(telephoneVal, setInputError);
    if (!!emailVal && !!nameVal && !!addressVal && !!cityVal && !!zipVal) {
      setSubmitting(true);
      try {
        await placeOrderTh({
          name: nameVal,
          email: emailVal,
          address: addressVal,
          city: cityVal,
          zip: zipVal,
          telephone: telephoneVal || null,
        });
        setOrderSuccesed(true);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          t("placeOrderSection.submitError");
        setSubmitError(msg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return isOrderSuccesed ? (
    <div className={style.orderSummary}>
      <div className={style.orderConfitmedContainer}>
        <h2>{t("placeOrderSection.orderConfirmed.title")}</h2>
        <span>{t("placeOrderSection.orderConfirmed.hint")}</span>
        <div className={style.backToMain}>
          <NavLink to="/orders">
            {t("placeOrderSection.orderConfirmed.viewOrders")}
          </NavLink>
        </div>
        <div className={style.backToMain}>
          <NavLink to="/">
            {t("placeOrderSection.orderConfirmed.button")}
          </NavLink>
        </div>
      </div>
    </div>
  ) : (
    <div className={style.orderSummary}>
      <h2>{t("placeOrderSection.title")}</h2>
      <form className={style.userInformation} onSubmit={(e) => handleSubmit(e)}>
        {submitError && <div className={style.submitError}>{submitError}</div>}
        <div className={style.inputBlock}>
          <label>* {t("placeOrderSection.email")}</label>
          <input
            type="text"
            className={style.yearInput}
            value={email}
            name={"email"}
            placeholder={t("placeOrderSection.emailPlaceholrer")}
            onChange={(e) => changeEmail(e.target.value)}
          />
          {inputError.email && (
            <span className={style.error}>{inputError.email}</span>
          )}
        </div>
        <div className={style.inputBlock}>
          <label>* {t("placeOrderSection.name")}</label>
          <input
            type="text"
            className={style.yearInput}
            value={name}
            name={"name"}
            placeholder={t("placeOrderSection.namePlaceholrer")}
            onChange={(e) => changeName(e.target.value)}
          />
          {inputError.name && (
            <span className={style.error}>{inputError.name}</span>
          )}
        </div>
        <div className={style.inputBlock}>
          <label>* {t("placeOrderSection.address")}</label>
          <input
            type="text"
            className={style.yearInput}
            value={address}
            name={"address"}
            placeholder={t("placeOrderSection.addressPlaceholrer")}
            onChange={(e) => changeAddress(e.target.value)}
          />
          {inputError.address && (
            <span className={style.error}>{inputError.address}</span>
          )}
        </div>
        <div className={style.inputBlock}>
          <label>* {t("placeOrderSection.city")}</label>
          <input
            type="text"
            className={style.yearInput}
            value={city}
            name={"city"}
            placeholder={t("placeOrderSection.cityPlaceholrer")}
            onChange={(e) => changeCity(e.target.value)}
          />
          {inputError.city && (
            <span className={style.error}>{inputError.city}</span>
          )}
        </div>
        <div className={style.inputBlock}>
          <label>* {t("placeOrderSection.zip")}</label>
          <input
            type="text"
            className={style.yearInput}
            value={zip}
            name={"zip"}
            placeholder={t("placeOrderSection.zipPlaceholrer")}
            onChange={(e) => changeZip(e.target.value)}
          />
          {inputError.zip && (
            <span className={style.error}>{inputError.zip}</span>
          )}
        </div>
        <div className={style.inputBlock}>
          <label>{t("placeOrderSection.telephone")}</label>
          <input
            type="text"
            className={style.yearInput}
            value={telephone}
            name={"telephone"}
            placeholder={t("placeOrderSection.telephonePlaceholrer")}
            onChange={(e) => changeTelephone(e.target.value)}
          />
          {inputError.telephone && (
            <span className={style.error}>{inputError.telephone}</span>
          )}
        </div>
        <div className={style.confirmButton}>
          <button type="submit" disabled={submitting}>
            {submitting ? "…" : t("placeOrderSection.makeOrderBTN")}
          </button>
        </div>
      </form>
    </div>
  );
};

const mapState = (state) => ({
  isAuth: state.auth.isAuth,
  role: state.auth.role,
  cartData: state.cart.cart,
});

PlaceOrder = connect(mapState, { placeOrderTh, getCartTh })(PlaceOrder);

export default PlaceOrder;
