import github from "../../../img/icons/contacts/github.svg";
import gmail from "../../../img/icons/contacts/gmail.svg";
import instagram from "../../../img/icons/contacts/instagram.svg";
import linkedin from "../../../img/icons/contacts/linkedin.svg";
import telegram from "../../../img/icons/contacts/telegram.svg";
import style from "./FooterContacts.module.scss";

let FooterContacts = () => {
  return (
    <div className={style.footerContacts}>
      <p>WPL</p>
      <ul>
        <li>
          <a
            href="https://www.linkedin.com/in/shaurya2k06/"
            title="LinkedIn"
            target="_blank"
            rel="noreferrer"
          >
            <img src={linkedin} alt="LinkedIn" />
          </a>
        </li>
        <li>
          <a
            href="https://github.com/shaurya2k06"
            title="GitHub"
            target="_blank"
            rel="noreferrer"
          >
            <img src={github} alt="GitHub" />
          </a>
        </li>
        <li>
          <a
            href="https://mailto:krrish.b@somaiya.edu"
            title="Gmail"
            target="_blank"
            rel="noreferrer"
          >
            <img src={gmail} alt="Gmail" />
          </a>
        </li>
        <li>
          <a
            href="https://www.instagram.com/pranav_skn/"
            title="Instagram"
            target="_blank"
            rel="noreferrer"
          >
            <img src={instagram} alt="Instagram" />
          </a>
        </li>
        <li>
          <a
            href="tg://resolve?domain=shaurya2k06"
            title="Telegram"
            target="_blank"
            rel="noreferrer"
          >
            <img src={telegram} alt="Telegram" />
          </a>
        </li>
      </ul>
    </div>
  );
};

export default FooterContacts;
