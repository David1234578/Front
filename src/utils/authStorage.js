const USERS_STORAGE_KEY = 'users';
const SESSION_STORAGE_KEY = 'session';

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
  const cleanEmail = toSafeString(email).toLowerCase();
  const cleanPassword = String(password ?? '').trim();

  if (!cleanEmail || !cleanPassword) {
    return { ok: false, message: 'Debes ingresar correo y clave.' };
  }

  const users = loadUsers();
  const found = users.find(
    (user) => user.email === cleanEmail && String(user.password) === cleanPassword
  );

  if (!found) {
    return { ok: false, message: 'Correo o clave incorrectos.' };
  }

  return { ok: true, user: saveSession(found) };
}

export function registerUser(payload) {
  const name = toSafeString(payload?.name);
  const email = toSafeString(payload?.email).toLowerCase();
  const city = toSafeString(payload?.city);
  const phone = toSafeString(payload?.phone);
  const password = String(payload?.password ?? '').trim();

  if (!name || !email || !password) {
    return { ok: false, message: 'Nombre, correo y clave son obligatorios.' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { ok: false, message: 'Ingresa un correo valido.' };
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.ok) {
    return { ok: false, message: passwordValidation.message };
  }

  const users = loadUsers();
  const exists = users.some((user) => user.email === email);

  if (exists) {
    return { ok: false, message: 'Ese correo ya esta registrado.' };
  }

  const nextId = users.reduce((acc, user) => Math.max(acc, Number(user.id) || 0), 0) + 1;

  const createdUser = normalizeUser({
    id: nextId,
    name,
    email,
    password,
    city,
    phone,
    role: 'user',
  });

  persistUsers([...users, createdUser]);

  return {
    ok: true,
    user: saveSession(createdUser),
  };
}

export function recoverPasswordByEmail(email) {
  const cleanEmail = toSafeString(email).toLowerCase();
  if (!cleanEmail) {
    return { ok: false, message: 'Debes ingresar un correo.' };
  }

  const users = loadUsers();
  const found = users.find((user) => user.email === cleanEmail);

  if (!found) {
    return { ok: false, message: 'No encontramos una cuenta con ese correo.' };
  }

  return {
    ok: true,
    message: `Tu clave actual es: ${found.password}`,
  };
}

export function updateCurrentUserProfile(payload) {
  const current = loadSession();
  if (!current) {
    return { ok: false, message: 'No hay sesion activa.' };
  }

  const users = loadUsers();
  const index = users.findIndex((user) => user.id === current.id);
  if (index === -1) {
    return { ok: false, message: 'No se encontro el usuario actual.' };
  }

  const name = toSafeString(payload?.name);
  const city = toSafeString(payload?.city);
  const phone = toSafeString(payload?.phone);
  const password = String(payload?.password ?? '').trim();

  if (!name) {
    return { ok: false, message: 'El nombre es obligatorio.' };
  }

  if (password) {
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.ok) {
      return { ok: false, message: passwordValidation.message };
    }
  }

  const updatedUser = {
    ...users[index],
    name,
    city,
    phone,
    password: password || users[index].password,
  };

  const nextUsers = [...users];
  nextUsers[index] = normalizeUser(updatedUser);
  persistUsers(nextUsers);

  return {
    ok: true,
    user: saveSession(nextUsers[index]),
  };
}

export const AUTH_SESSION_KEY = SESSION_STORAGE_KEY;