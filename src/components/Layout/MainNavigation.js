import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import AuthContext from "../../store/auth-context";
import classes from "./MainNavigation.module.css";

const MainNavigation = () => {
  const authCtx = useContext(AuthContext);
  const history = useHistory();

  const logoutHandler = () => {
    authCtx.logout();
    history.replace("/");
  };
  return (
    <header className={classes.header}>
      <Link to="/">
        <div className={classes.logo}>React Auth</div>
      </Link>
      <nav>
        <ul>
          {!authCtx.isLoggedIn && (
            <li>
              <Link to="/auth">Login</Link>
            </li>
          )}

          {authCtx.isLoggedIn && (
            <li>
              <Link to="/profile">Profile</Link>
            </li>
          )}

          <li>
            {authCtx.isLoggedIn && (
              <button onClick={logoutHandler}>Logout</button>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;
