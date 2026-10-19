// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { setupAxiosInterceptors } from "../api/axiosClient";

const AuthContext = createContext({
  token: null,
  setToken: () => {},
  api: null,
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [api, setApi] = useState(null);

  useEffect(() => {
    try {
      const client = setupAxiosInterceptors(setToken);
      if (typeof client?.get !== "function") {
        throw new TypeError("El cliente API no proporciona el método get.");
      }
      setApi(() => client);
    } catch (error) {
      console.error("Error al inicializar el cliente API:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);