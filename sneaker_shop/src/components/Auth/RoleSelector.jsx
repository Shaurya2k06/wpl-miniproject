import style from "./Auth.module.scss";
import { useTranslation } from "react-i18next";

const RoleSelector = ({ onSelect }) => {
  const { t } = useTranslation();

  return (
    <div className={style.authContainer}>
      <h2>{t("auth.welcomeTitle") || "Welcome to Sneaker Shop"}</h2>
      <p>{t("auth.selectRole") || "Please select how you want to continue:"}</p>
      
      <div className={style.roleSelector}>
        <div className={style.roleCard} onClick={() => onSelect('user')}>
          <h3>{t("auth.roles.customerTitle") || "Sneaker Head"}</h3>
          <p>{t("auth.roles.customerDesc") || "Browse and buy the latest kicks."}</p>
        </div>
        
        <div className={style.roleCard} onClick={() => onSelect('owner')}>
          <h3>{t("auth.roles.ownerTitle") || "Business Owner"}</h3>
          <p>{t("auth.roles.ownerDesc") || "Manage your store and view analytics."}</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
