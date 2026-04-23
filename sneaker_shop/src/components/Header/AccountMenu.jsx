import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import style from "./AccountMenu.module.scss";

const PersonIcon = () => (
  <svg
    className={style.personSvg}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
      fill="currentColor"
    />
  </svg>
);

const AccountMenu = ({ email, role, logout, onNavigate }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div className={style.wrap} ref={wrapRef}>
      <button
        type="button"
        className={style.trigger}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("accountMenu.open")}
        onClick={() => setOpen((v) => !v)}
      >
        <PersonIcon />
      </button>
      {open && (
        <div className={style.dropdown} role="menu">
          <div className={style.panel}>
            <p className={style.label}>{t("accountMenu.signedInAs")}</p>
            <p className={style.email}>{email || "—"}</p>
            <p className={style.roleRow}>
              <span className={style.label}>{t("accountMenu.accountType")}</span>
              <span className={style.roleValue}>
                {role === "owner"
                  ? t("accountMenu.roleOwner")
                  : t("accountMenu.roleCustomer")}
              </span>
            </p>
            <div className={style.divider} />
            {role === "user" && (
              <NavLink
                className={style.menuLink}
                to="/orders"
                role="menuitem"
                onClick={close}
              >
                {t("menu.myOrders")}
              </NavLink>
            )}
            {role === "owner" && (
              <NavLink
                className={style.menuLink}
                to="/admin"
                role="menuitem"
                onClick={close}
              >
                {t("menu.admin")}
              </NavLink>
            )}
            <button
              type="button"
              className={style.signOut}
              role="menuitem"
              onClick={() => {
                close();
                logout();
              }}
            >
              {t("menu.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
