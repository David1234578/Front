import { createContext, useMemo, useState } from 'react';

import authService from '../services/authService';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(authService.getSessionUser);

  const register = (payload) => {
    const result = authService.register(payload);

    if (result.ok) {
      setCurrentUser(result.user);
    }

    return result;
  };

  const login = (payload) => {
    const result = authService.login(payload);

    if (result.ok) {
      setCurrentUser(result.user);
    }

    return result;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isAdmin: currentUser?.role === 'admin',
      login,
      logout,
      register,
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
