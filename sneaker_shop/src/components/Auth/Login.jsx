import style from "./Auth.module.scss";
import { useState } from "react";
import { connect } from "react-redux";
import { loginTh } from "../../redux/auth_reducer";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RoleSelector from "./RoleSelector";

const Login = ({ loginTh, isAuth, authError, role }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setRole] = useState(null);
  const { t } = useTranslation();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginTh(email, password, selectedRole);
  };

  if (!selectedRole) {
    return <RoleSelector onSelect={setRole} />;
  }

  if (isAuth) {
    const from = location.state?.from?.pathname || (role === 'owner' ? '/admin' : '/');
    return <Navigate to={from} replace />;
  }

  return (
    <div className={style.authContainer}>
      <h2>{t("auth.login") || "Login"}</h2>
      <p>{t("auth.loggingAs") || "Logging in as"} <strong>{selectedRole === 'owner' ? 'Business Owner' : 'Sneaker Head'}</strong></p>
      
      <form className={style.form} onSubmit={handleSubmit}>
        <div className={style.inputGroup}>
          <label>{t("auth.email") || "Email"}</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="sneakerhead@example.com"
          />
        </div>
        
        <div className={style.inputGroup}>
          <label>{t("auth.password") || "Password"}</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
        </div>

        {authError && <div className={style.error}>{authError}</div>}

        <button type="submit">{t("auth.login") || "Sign In"}</button>
      </form>

      <div className={style.switchAuth}>
        {t("auth.noAccount") || "Don't have an account?"} 
        <Link to="/register">{t("auth.registerLink") || "Register here"}</Link>
      </div>
      
      <div className={style.switchAuth}>
        <button onClick={() => setRole(null)} style={{background: 'none', color: 'inherit', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textDecoration: 'underline'}}>
          {t("auth.changeRole") || "Change Role"}
        </button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuth: state.auth.isAuth,
  authError: state.auth.authError,
  role: state.auth.role,
});

export default connect(mapStateToProps, { loginTh })(Login);

