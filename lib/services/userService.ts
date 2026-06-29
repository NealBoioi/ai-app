export type UserRole = "Customer" | "Admin";

export type PortalUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  companyName: string;
  role: UserRole;
  approved: boolean;
};

const STORAGE_KEY = "users";

const fallbackUsers: PortalUser[] = [
  {
    id: "admin-1",
    email: "admin@test.com",
    password: "admin123",
    name: "Admin User",
    companyName: "QuotePortal",
    role: "Admin",
    approved: true,
  },
];

export function getUsers(): PortalUser[] {
  return readUsers();
}

export function createUser(user: Omit<PortalUser, "id">): PortalUser {
  const users = readUsers();
  const newUser: PortalUser = {
    ...user,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}

export function updateUser(userId: string, updates: Partial<PortalUser>) {
  const users = readUsers();
  const target = users.find((user) => user.id === userId);
  if (!target) {
    return undefined;
  }

  Object.assign(target, updates);
  writeUsers(users);
  return target;
}

export function findUserByEmail(email: string) {
  return readUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function authenticateUser(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return undefined;
  }

  return user;
}

function readUsers(): PortalUser[] {
  if (typeof window === "undefined") {
    return fallbackUsers;
  }

  try {
    const rawValue = window.localStorage.getItem(`quoteportal:${STORAGE_KEY}`);
    if (!rawValue) {
      return fallbackUsers;
    }

    const parsed = JSON.parse(rawValue) as PortalUser[];
    return parsed.length > 0 ? parsed : fallbackUsers;
  } catch {
    return fallbackUsers;
  }
}

function writeUsers(users: PortalUser[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`quoteportal:${STORAGE_KEY}`, JSON.stringify(users));
}
