import { appConfig } from '../config';
import {
  clearSessionUser,
  createUser,
  findUserByEmail,
  loadSessionUser,
  loadUsers,
  saveSessionUser,
  updateUser,
} from '../utils/authStorage';

import { requestJson } from './http';

const MIN_REGISTER_PASSWORD_LENGTH = 6;
const MIN_CHANGE_PASSWORD_LENGTH = 8;
const TOKEN_STORAGE_KEY = 'authToken';

const normalizeRole = (role) => {
  const normalizedRole = String(role ?? '')
    .trim()
    .toLowerCase();

  return normalizedRole === 'admin' ? 'admin' : 'user';
};

const getFullName = (firstName, lastName, fallback = '') => {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
  return fullName || String(fallback ?? '').trim();
};

const normalizeEmail = (email) =>
  String(email ?? '')
    .trim()
    .toLowerCase();

const toSessionUser = (user) => {
  if (!user) {
    return null;
  }

  const firstName = String(user.firstName ?? '').trim();
  const lastName = String(user.lastName ?? '').trim();
  const fullName = getFullName(firstName, lastName, user.fullName ?? user.name);

  return {
    id: user.id,
    firstName,
    lastName,
    fullName,
    name: fullName,
    email: user.email,
    role: normalizeRole(user.role),
    phone: String(user.phone ?? '').trim(),
    status: String(user.status ?? 'ACTIVE').trim() || 'ACTIVE',
    createdAt: String(user.createdAt ?? ''),
  };
};

const getErrorMessage = (error, fallback) =>
  error instanceof Error && error.message ? error.message : fallback;

const loadSessionToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return String(window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
};

const saveSessionToken = (token) => {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedToken = String(token ?? '').trim();

  if (!normalizedToken) {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken);
};

const clearSessionToken = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
};

const normalizeAuthResponse = (payload) => {
  const sessionUser = toSessionUser(payload?.user ?? payload);

  if (!sessionUser) {
    return { ok: false, error: 'La respuesta de autenticación no contiene un usuario válido.' };
  }

  saveSessionUser(sessionUser);
  saveSessionToken(payload?.sessionToken ?? payload?.token);

  return {
    ok: true,
    user: sessionUser,
    token: String(payload?.sessionToken ?? payload?.token ?? ''),
    sessionId: String(payload?.sessionId ?? ''),
    expiresAt: String(payload?.expiresAt ?? ''),
    cart: payload?.cart ?? null,
  };
};

function registerLocal({ firstName, lastName, email, password, phone }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedFirstName = String(firstName ?? '').trim();
  const normalizedLastName = String(lastName ?? '').trim();

  if (!normalizedFirstName) {
    return { ok: false, error: 'Ingresa el nombre para crear la cuenta.' };
  }

  if (!normalizedLastName) {
    return { ok: false, error: 'Ingresa el apellido para crear la cuenta.' };
  }

  if (!normalizedEmail) {
    return { ok: false, error: 'Ingresa un correo electrónico válido.' };
  }

  if (!password || password.length < MIN_REGISTER_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La contraseña debe tener al menos ${MIN_REGISTER_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (findUserByEmail(normalizedEmail)) {
    return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };
  }

  const user = createUser({
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    email: normalizedEmail,
    password,
    phone,
  });
  saveSessionUser(user);

  return { ok: true, user };
}

function loginLocal({ email, password }) {
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return { ok: false, error: 'Credenciales inválidas. Verifica correo y contraseña.' };
  }

  const sessionUser = toSessionUser(user);
  saveSessionUser(sessionUser);

  return { ok: true, user: sessionUser };
}

async function register(payload) {
  if (!appConfig.useRemoteApi) {
    return registerLocal(payload);
  }

  try {
    const response = await requestJson('/auth/register', {
      method: 'POST',
      body: payload,
    });

    return normalizeAuthResponse(response);
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible registrar la cuenta en este momento.'),
    };
  }
}

async function login(payload) {
  if (!appConfig.useRemoteApi) {
    return loginLocal(payload);
  }

  try {
    const response = await requestJson('/auth/login', {
      method: 'POST',
      body: payload,
    });

    return normalizeAuthResponse(response);
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible iniciar sesión en este momento.'),
    };
  }
}

async function hydrateSession() {
  const sessionUser = loadSessionUser();

  if (!appConfig.useRemoteApi) {
    return { ok: true, user: sessionUser };
  }

  const token = loadSessionToken();

  if (!token) {
    return { ok: true, user: null };
  }

  try {
    const response = await requestJson('/auth/me', {
      method: 'GET',
      token,
    });

    return normalizeAuthResponse({ user: response, token });
  } catch (error) {
    clearSessionUser();
    clearSessionToken();

    return {
      ok: false,
      user: null,
      error: getErrorMessage(error, 'No fue posible restaurar la sesión actual.'),
    };
  }
}

async function logout() {
  if (appConfig.useRemoteApi) {
    try {
      const token = loadSessionToken();

      if (token) {
        await requestJson('/auth/logout', {
          method: 'POST',
          token,
        });
      }
    } catch {
      // Clear local session even if remote logout fails.
    }
  }

  clearSessionUser();
  clearSessionToken();

  return { ok: true };
}

function getSessionUser() {
  return loadSessionUser();
}

function listUsers() {
  return loadUsers();
}

async function updateProfile(userId, updates) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return { ok: false, error: 'No existe una sesión válida para actualizar el perfil.' };
  }

  const profileUpdates = {
    firstName: String(updates?.firstName ?? '').trim(),
    lastName: String(updates?.lastName ?? '').trim(),
    phone: String(updates?.phone ?? '').trim(),
  };

  if (!profileUpdates.firstName) {
    return { ok: false, error: 'El nombre es obligatorio para actualizar el perfil.' };
  }

  if (!profileUpdates.lastName) {
    return { ok: false, error: 'El apellido es obligatorio para actualizar el perfil.' };
  }

  if (!appConfig.useRemoteApi) {
    const updatedUser = updateUser(normalizedUserId, profileUpdates);

    if (!updatedUser) {
      return { ok: false, error: 'No fue posible actualizar el perfil actual.' };
    }

    return { ok: true, user: updatedUser };
  }

  try {
    const token = loadSessionToken();
    const response = await requestJson('/users/me', {
      method: 'PUT',
      body: profileUpdates,
      token,
    });

    const normalizedResponse = response?.user
      ? normalizeAuthResponse({ ...response, token: response.token ?? token })
      : normalizeAuthResponse({ user: response, token });

    if (!normalizedResponse.ok) {
      return normalizedResponse;
    }

    return { ok: true, user: normalizedResponse.user };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible actualizar el perfil en este momento.'),
    };
  }
}

async function changePassword(userId, currentPassword, newPassword) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return { ok: false, error: 'No existe una sesión válida para cambiar la contraseña.' };
  }

  if (!currentPassword) {
    return { ok: false, error: 'Debes ingresar la contraseña actual.' };
  }

  if (!newPassword || newPassword.length < MIN_CHANGE_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La nueva contraseña debe tener al menos ${MIN_CHANGE_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (currentPassword === newPassword) {
    return { ok: false, error: 'La nueva contraseña debe ser diferente a la actual.' };
  }

  if (!appConfig.useRemoteApi) {
    const user = loadUsers().find((savedUser) => savedUser.id === normalizedUserId) ?? null;

    if (!user || user.password !== currentPassword) {
      return { ok: false, error: 'La contraseña actual es incorrecta.' };
    }

    const updatedUser = updateUser(normalizedUserId, { password: newPassword });

    if (!updatedUser) {
      return { ok: false, error: 'No fue posible actualizar la contraseña.' };
    }

    return { ok: true, user: updatedUser };
  }

  try {
    const token = loadSessionToken();
    await requestJson('/users/me/password', {
      method: 'PUT',
      body: {
        currentPassword,
        newPassword,
      },
      token,
    });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error, 'No fue posible cambiar la contraseña en este momento.'),
    };
  }
}

const authService = {
  changePassword,
  hydrateSession,
  getSessionUser,
  listUsers,
  login,
  logout,
  register,
  updateProfile,
};

export { authService };
export default authService;
