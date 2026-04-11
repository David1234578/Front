import { createContext, useMemo, useState } from 'react';

import {
  authenticateUser,
  clearSession,
  loadSession,
  registerUser,
  updateCurrentUserProfile,
} from '../utils/authStorage';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession);

  const login = ({ email, password }) => {
    const result = authenticateUser(email, password);

    if (!result.ok) {
      return result;
    }

    setCurrentUser(result.user);
    return result;
  };

  const register = ({ name, email, city, phone, password }) => {
    const result = registerUser({ name, email, city, phone, password });

    if (!result.ok) {
      return result;
    }

    setCurrentUser(result.user);
    return result;
  };

  const updateProfile = (payload) => {
    const result = updateCurrentUserProfile(payload);

    if (!result.ok) {
      return result;
    }

    setCurrentUser(result.user);
    return result;
  };

  const logout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      updateProfile,
      logout,
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };
