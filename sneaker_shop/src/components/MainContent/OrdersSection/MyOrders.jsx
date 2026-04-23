import style from "./MyOrders.module.scss";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import Preloader from "../../common/preloader/Preloader";
import { ordersApi } from "../../../api/api";

const formatPlacedAt = (iso) => {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

const MyOrders = ({ isAuth, role }) => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuth || role !== "user") return;
    let cancelled = false;
    ordersApi
      .list()
      .then((res) => {
        if (!cancelled) setOrders(res.data);
      })
      .catch(() => {
        if (!cancelled) setError("load");
      });
    return () => {
      cancelled = true;
    };
  }, [isAuth, role]);

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/orders" } }} />;
  }

  if (role !== "user") {
    return <Navigate to="/admin" replace />;
  }

  if (error) {
    return (
      <section className={`${style.wrap} ${style.centered}`}>
        <header className={style.pageHeader}>
          <h1 className={style.title}>{t("ordersSection.title")}</h1>
        </header>
        <p className={style.error}>{t("ordersSection.loadError")}</p>
        <NavLink to="/" className={style.linkBtn}>
          {t("placeOrderSection.orderConfirmed.button")}
        </NavLink>
      </section>
    );
  }

  if (orders === null) {
    return <Preloader />;
  }

  if (!orders.length) {
    return (
      <section className={style.wrap}>
        <header className={style.pageHeader}>
          <h1 className={style.title}>{t("ordersSection.title")}</h1>
          <p className={style.subtitle}>{t("ordersSection.subtitle")}</p>
        </header>
        <div className={`${style.emptyCard} ${style.centered}`}>
          <p className={style.empty}>{t("ordersSection.empty")}</p>
          <NavLink to="/sneakers" className={style.linkBtn}>
            {t("ordersSection.shop")}
          </NavLink>
        </div>
      </section>
    );
  }

  return (
    <section className={style.wrap}>
      <header className={style.pageHeader}>
        <h1 className={style.title}>{t("ordersSection.title")}</h1>
        <p className={style.subtitle}>{t("ordersSection.subtitle")}</p>
      </header>
      <ul className={style.list}>
        {orders.map((order) => (
          <li key={order.id} className={style.card}>
            <div className={style.cardHead}>
              <div className={style.headCell}>
                <span className={style.muted}>{t("ordersSection.orderNumber")}</span>
                <span className={style.orderId}>{String(order.id).slice(0, 8)}…</span>
              </div>
              <div className={style.headCell}>
                <span className={style.muted}>{t("ordersSection.placed")}</span>
                <span className={style.dateValue}>{formatPlacedAt(order.createdAt)}</span>
              </div>
              <div className={style.headCell}>
                <span className={style.muted}>{t("ordersSection.status")}</span>
                <span className={style.status}>{order.status}</span>
              </div>
              <div className={style.total}>
                <span className={style.totalLabel}>{t("ordersSection.total")}</span>
                ${Number(order.totalAmount).toFixed(2)}
              </div>
            </div>
            <div className={style.items}>
              <h3>{t("ordersSection.items")}</h3>
              <ul>
                {order.items.map((line) => (
                  <li key={line.id} className={style.line}>
                    {line.image && (
                      <img src={line.image} alt="" className={style.thumb} />
                    )}
                    <div className={style.lineBody}>
                      <span className={style.lineName}>{line.name}</span>
                      <span className={style.meta}>
                        {t("ordersSection.size")} {line.size} US · ×{line.quantity} · $
                        {Number(line.price).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default connect((state) => ({
  isAuth: state.auth.isAuth,
  role: state.auth.role,
}))(MyOrders);
