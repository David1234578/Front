import {
  clearSessionUser,
  createUser,
  findUserByEmail,
  loadSessionUser,
  loadUsers,
  saveSessionUser,
  updateUser,
} from '../utils/authStorage';

const MIN_PASSWORD_LENGTH = 6;

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

function register({ name, email, password }) {
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

function login({ email, password }) {
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return { ok: false, error: 'Credenciales inválidas. Verifica correo y contraseña.' };
  }

  const sessionUser = toSessionUser(user);
  saveSessionUser(sessionUser);

  return { ok: true, user: sessionUser };
}

function logout() {
  clearSessionUser();
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
  getSessionUser,
  listUsers,
  login,
  logout,
  register,
  updateProfile,
};

export { authService };
export default authService;
