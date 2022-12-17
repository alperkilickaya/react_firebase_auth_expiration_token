import { useState, useEffect, useCallback } from "react";
import { createContext } from "react";

// if user manually logout clears the timer
let logoutTimer;

const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calculateRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();
  const remainingDuration = adjExpirationTime - currentTime;
  return remainingDuration;
};

const retrieveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime");
  const remainingTime = calculateRemainingTime(storedExpirationDate);

  // if remaining time below one minute clear the token and token expiration time from local storage and return null
  if (remainingTime <= 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }

  // if remaining time is between 1 hour to 1 minute it measn token is still valid and return token and remaining time
  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const AuthContextProvider = (props) => {
  const tokenData = retrieveStoredToken();

  // check local storage for existing token.

  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }
  const [token, setToken] = useState(initialToken);

  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);

    // Remove token from local storage
    localStorage.removeItem("token");
    // Remove token expiration time from local storage
    localStorage.removeItem("expirationTime");

    // if user logout before token expire time, remove token expiration time from local storage
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token, expirationTime) => {
    setToken(token);

    // Store token in local storage
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);

    // calculate remaining time
    const remainingTime = calculateRemainingTime(expirationTime);

    // Set timer to remove token from local storage
    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  // if tokenData is not null and user in login state, update timer to remove token from local storage
  useEffect(() => {
    if (tokenData) {
      console.log("time left to expire token:", tokenData.duration);
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
