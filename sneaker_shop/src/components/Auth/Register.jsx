import style from "./Auth.module.scss";
import { useState } from "react";
import { connect } from "react-redux";
import { registerTh } from "../../redux/auth_reducer";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Register = ({ registerTh, isAuth, authError, role }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setRole] = useState("user");
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }
    registerTh({ email, password, role: selectedRole });
  };

  if (isAuth) {
    return <Navigate to={role === 'owner' ? '/admin' : '/'} replace />;
  }

  return (
    <div className={style.authContainer}>
      <h2>{t("auth.register") || "Create Account"}</h2>
      <p>{t("auth.joinUs") || "Join the Sneaker Community"}</p>
      
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

        <div className={style.inputGroup}>
          <label>{t("auth.confirmPassword") || "Confirm Password"}</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            placeholder="••••••••"
          />
        </div>

        <div className={style.inputGroup}>
          <label>{t("auth.selectRole") || "I am a..."}</label>
          <select value={selectedRole} onChange={(e) => setRole(e.target.value)}>
             <option value="user">Sneaker Head (Customer)</option>
             <option value="owner">Business Owner (Admin)</option>
          </select>
        </div>

        {authError && <div className={style.error}>{authError}</div>}

        <button type="submit">{t("auth.register") || "Sign Up"}</button>
      </form>

      <div className={style.switchAuth}>
        {t("auth.haveAccount") || "Already have an account?"} 
        <Link to="/login">{t("auth.loginLink") || "Login here"}</Link>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  isAuth: state.auth.isAuth,
  authError: state.auth.authError,
  role: state.auth.role,
});

export default connect(mapStateToProps, { registerTh })(Register);
