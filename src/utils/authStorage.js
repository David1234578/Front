const USERS_STORAGE_KEY = 'users';
const SESSION_STORAGE_KEY = 'session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

const defaultUsers = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@ventas.com',
    password: 'Admin123*',
    role: 'admin',
    city: 'Medellin',
    phone: '3000000000',
  },
  {
    id: 2,
    name: 'Cliente',
    email: 'cliente@ventas.com',
    password: 'Cliente123*',
    role: 'user',
    city: 'Medellin',
    phone: '3010000000',
  },
];

const toSafeString = (value) => String(value ?? '').trim();

const isValidEmail = (email) => EMAIL_PATTERN.test(toSafeString(email).toLowerCase());

const validateName = (name) => {
  const value = toSafeString(name);

  if (!value) {
    return { ok: false, message: 'El nombre es obligatorio.' };
  }

  if (value.length < 3) {
    return { ok: false, message: 'El nombre debe tener al menos 3 caracteres.' };
  }

  return { ok: true, value };
};

const validatePhone = (phone) => {
  const value = toSafeString(phone);

  if (!value) {
    return { ok: true, value: '' };
  }

  const normalized = value.replace(/[\s()-]/g, '');
  if (!PHONE_PATTERN.test(normalized)) {
    return { ok: false, message: 'El telefono debe tener entre 7 y 15 digitos.' };
  }

  return { ok: true, value: normalized };
};

const validateCity = (city) => {
  const value = toSafeString(city);

  if (!value) {
    return { ok: true, value: '' };
  }

  if (value.length < 2) {
    return { ok: false, message: 'La ciudad debe tener al menos 2 caracteres.' };
  }

  return { ok: true, value };
};

const normalizeUser = (user) => ({
  id: Number(user?.id) || Date.now(),
  name: toSafeString(user?.name) || 'Usuario',
  email: toSafeString(user?.email).toLowerCase(),
  password: String(user?.password ?? ''),
  role: user?.role === 'admin' ? 'admin' : 'user',
  city: toSafeString(user?.city),
  phone: toSafeString(user?.phone),
});

const withWindow = () => typeof window !== 'undefined';

const validatePasswordStrength = (password) => {
  const value = String(password ?? '').trim();

  if (value.length < 6) {
    return {
      ok: false,
      message: 'La clave debe tener al menos 6 caracteres.',
    };
  }

  if (!/[A-Z]/.test(value)) {
    return {
      ok: false,
      message: 'La clave debe incluir al menos una mayuscula.',
    };
  }

  if (!/\d/.test(value)) {
    return {
      ok: false,
      message: 'La clave debe incluir al menos un numero.',
    };
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    return {
      ok: false,
      message: 'La clave debe incluir al menos un simbolo.',
    };
  }

  return { ok: true, message: '' };
};

const validateEmailInput = (email) => {
  const value = toSafeString(email).toLowerCase();

  if (!value) {
    return { ok: false, message: 'Debes ingresar un correo.' };
  }

  if (!isValidEmail(value)) {
    return { ok: false, message: 'Ingresa un correo valido.' };
  }

  return { ok: true, value };
};

const buildResponse = ({ ok, status, message = '', error = '', data = {}, ...extra }) => ({
  ok,
  status,
  message,
  error,
  data,
  ...extra,
});

const buildSuccess = ({ status, message, data = {}, ...extra }) =>
  buildResponse({ ok: true, status, message, data, ...extra });

const buildError = ({ status, message, data = {}, ...extra }) =>
  buildResponse({ ok: false, status, message, error: message, data, ...extra });

const persistUsers = (users) => {
  if (!withWindow()) return users;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return users;
};

export function loadUsers() {
  if (!withWindow()) return defaultUsers;

  const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    return persistUsers(defaultUsers.map(normalizeUser));
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return persistUsers(defaultUsers.map(normalizeUser));
    }

    return persistUsers(parsed.map(normalizeUser));
  } catch {
    return persistUsers(defaultUsers.map(normalizeUser));
  }
}

export function saveSession(user) {
  if (!withWindow()) return null;

  const safeUser = normalizeUser(user);
  const session = {
    id: safeUser.id,
    name: safeUser.name,
    email: safeUser.email,
    role: safeUser.role,
    city: safeUser.city,
    phone: safeUser.phone,
  };

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function loadSession() {
  if (!withWindow()) return null;

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.email) return null;
    return {
      id: Number(parsed.id) || 0,
      name: toSafeString(parsed.name) || 'Usuario',
      email: toSafeString(parsed.email).toLowerCase(),
      role: parsed.role === 'admin' ? 'admin' : 'user',
      city: toSafeString(parsed.city),
      phone: toSafeString(parsed.phone),
    };
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!withWindow()) return null;
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  return null;
}

export function authenticateUser(email, password) {
  const emailValidation = validateEmailInput(email);
  const cleanPassword = String(password ?? '').trim();

  if (!emailValidation.ok) {
    return buildError({ status: 400, message: emailValidation.message });
  }

  if (!cleanPassword) {
    return buildError({ status: 400, message: 'Debes ingresar correo y clave.' });
  }

  const cleanEmail = emailValidation.value;

  const users = loadUsers();
  const found = users.find(
    (user) => user.email === cleanEmail && String(user.password) === cleanPassword
  );

  if (!found) {
    return buildError({ status: 401, message: 'Correo o clave incorrectos.' });
  }

  const user = saveSession(found);

  return buildSuccess({
    status: 200,
    message: 'Inicio de sesion correcto.',
    user,
    data: { user },
  });
}

export function registerUser(payload) {
  const nameValidation = validateName(payload?.name);
  const emailValidation = validateEmailInput(payload?.email);
  const cityValidation = validateCity(payload?.city);
  const phoneValidation = validatePhone(payload?.phone);
  const password = String(payload?.password ?? '').trim();

  if (!nameValidation.ok) {
    return buildError({ status: 400, message: nameValidation.message });
  }

  if (!emailValidation.ok) {
    return buildError({ status: 400, message: emailValidation.message });
  }

  if (!cityValidation.ok) {
    return buildError({ status: 400, message: cityValidation.message });
  }

  if (!phoneValidation.ok) {
    return buildError({ status: 400, message: phoneValidation.message });
  }

  if (!password) {
    return buildError({ status: 400, message: 'La clave es obligatoria.' });
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.ok) {
    return buildError({ status: 400, message: passwordValidation.message });
  }

  const users = loadUsers();
  const email = emailValidation.value;
  const exists = users.some((user) => user.email === email);

  if (exists) {
    return buildError({ status: 409, message: 'Ese correo ya esta registrado.' });
  }

  const nextId = users.reduce((acc, user) => Math.max(acc, Number(user.id) || 0), 0) + 1;

  const createdUser = normalizeUser({
    id: nextId,
    name: nameValidation.value,
    email,
    password,
    city: cityValidation.value,
    phone: phoneValidation.value,
    role: 'user',
  });

  persistUsers([...users, createdUser]);

  const user = saveSession(createdUser);

  return buildSuccess({
    status: 201,
    message: 'Usuario creado correctamente.',
    user,
    data: { user },
  });
}

export function recoverPasswordByEmail(email) {
  const emailValidation = validateEmailInput(email);
  if (!emailValidation.ok) {
    return buildError({ status: 400, message: emailValidation.message });
  }

  const users = loadUsers();
  const found = users.find((user) => user.email === emailValidation.value);

  if (!found) {
    return buildError({ status: 404, message: 'No encontramos una cuenta con ese correo.' });
  }

  return buildSuccess({
    status: 200,
    message: 'Si el correo existe, enviaremos las instrucciones de recuperacion.',
    data: { email: emailValidation.value },
  });
}

export function updateCurrentUserProfile(payload) {
  const current = loadSession();
  if (!current) {
    return buildError({ status: 401, message: 'No hay sesion activa.' });
  }

  const users = loadUsers();
  const index = users.findIndex((user) => user.id === current.id);
  if (index === -1) {
    return buildError({ status: 404, message: 'No se encontro el usuario actual.' });
  }

  const nameValidation = validateName(payload?.name);
  const cityValidation = validateCity(payload?.city);
  const phoneValidation = validatePhone(payload?.phone);
  const password = String(payload?.password ?? '').trim();

  if (!nameValidation.ok) {
    return buildError({ status: 400, message: nameValidation.message });
  }

  if (!cityValidation.ok) {
    return buildError({ status: 400, message: cityValidation.message });
  }

  if (!phoneValidation.ok) {
    return buildError({ status: 400, message: phoneValidation.message });
  }

  if (password) {
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.ok) {
      return buildError({ status: 400, message: passwordValidation.message });
    }
  }

  const updatedUser = {
    ...users[index],
    name: nameValidation.value,
    city: cityValidation.value,
    phone: phoneValidation.value,
    password: password || users[index].password,
  };

  const nextUsers = [...users];
  nextUsers[index] = normalizeUser(updatedUser);
  persistUsers(nextUsers);

  const user = saveSession(nextUsers[index]);

  return buildSuccess({
    status: 200,
    message: 'Perfil actualizado correctamente.',
    user,
    data: { user },
  });
}

export const AUTH_SESSION_KEY = SESSION_STORAGE_KEY;