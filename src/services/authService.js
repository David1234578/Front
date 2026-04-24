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

const MIN_PASSWORD_LENGTH = 6;
const TOKEN_STORAGE_KEY = 'authToken';

const normalizeEmail = (email) =>
  String(email ?? '')
    .trim()
    .toLowerCase();

const toSessionUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    city: user.city,
    postalCode: user.postalCode,
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
  saveSessionToken(payload?.token);

  return { ok: true, user: sessionUser, token: String(payload?.token ?? '') };
};

function registerLocal({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!name?.trim()) {
    return { ok: false, error: 'Ingresa un nombre para crear la cuenta.' };
  }

  if (!normalizedEmail) {
    return { ok: false, error: 'Ingresa un correo electrónico válido.' };
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }

  if (findUserByEmail(normalizedEmail)) {
    return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };
  }

  const user = createUser({ name: name.trim(), email: normalizedEmail, password });
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
    name: String(updates?.name ?? '').trim(),
    phone: String(updates?.phone ?? '').trim(),
    address: String(updates?.address ?? '').trim(),
    city: String(updates?.city ?? '').trim(),
    postalCode: String(updates?.postalCode ?? '').trim(),
  };

  if (!profileUpdates.name) {
    return { ok: false, error: 'El nombre es obligatorio para actualizar el perfil.' };
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
    const response = await requestJson('/auth/profile', {
      method: 'PATCH',
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

  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
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
    const response = await requestJson('/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword,
        newPassword,
      },
      token,
    });

    if (response?.user) {
      const normalizedResponse = normalizeAuthResponse({
        ...response,
        token: response.token ?? token,
      });

      if (!normalizedResponse.ok) {
        return normalizedResponse;
      }

      return { ok: true, user: normalizedResponse.user };
    }

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
