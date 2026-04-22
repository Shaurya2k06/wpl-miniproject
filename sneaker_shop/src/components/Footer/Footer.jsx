import logo from "../../img/logo/logo2.png";
import style from "./Footer.module.scss";
import FooterContacts from "./FooterContacts/FooterContacts";

let Footer = () => {
  return (
    <footer className={style.footerContainer}>
      <div className={style.footerContent}>
        <div className={style.footerTopRow}>
          <div className={style.logo}>
            <img src={logo} alt="Sneaker Shop logo" />
            <h2>Sneaker Shop</h2>
          </div>
          <FooterContacts />
        </div>
      </div>
      <small>&copy; Sneaker Shop</small>
    </footer>
  );
};

export default Footer;
