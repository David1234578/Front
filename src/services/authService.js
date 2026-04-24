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

function updateProfile(userId, updates) {
  return updateUser(userId, updates);
}

const authService = {
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
