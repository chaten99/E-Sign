export const ROLE_HOME_PATHS = {
  admin: "/admin",
  officer: "/officer",
  reader: "/reader",
};

export const getHomePathByRole = (role) => ROLE_HOME_PATHS[role] || "/login";
