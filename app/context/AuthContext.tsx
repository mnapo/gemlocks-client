import React, { createContext, useState, useEffect, useContext } from "react";
import client from "../api/feathersClient";

interface AuthContextProps {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const reauthenticate = async () => {
      try {
        const { user } = await client.reAuthenticate();
        setUser(user);
      } catch {
        setUser(null);
      }
    };
    reauthenticate();
  }, []);

  const login = async (email: string, password: string) => {
    const { user } = await client.authenticate({
      strategy: "local",
      email,
      password,
    });
    setUser(user);
  };

  const register = async (email: string, password: string) => {
    await client.service("users").create({ email, password });
    await login(email, password);
  };

  const logout = async () => {
    await client.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};