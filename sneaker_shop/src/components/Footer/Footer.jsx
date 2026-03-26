import logo from "../../img/logo/logo2.png";
import style from "./Footer.module.scss";
import FooterContacts from "./FooterContacts/FooterContacts";

let Footer = () => {
  return (
    <footer className={style.footerContainer}>
      <div className={style.footerContent}>
        <div className={style.logo}>
          <img src={logo} alt="logo" />
          <h2>Sneakers Shop</h2>




          <FooterContacts />
        </div>
      </div>
      <small>&copy; Sneaker Shop</small>
    </footer>
  );
};

export default Footer;
