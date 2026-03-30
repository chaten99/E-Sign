import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getHomePathByRole } from "@/lib/roleRoutes";

export const PublicRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user);

  if (user) {
    return <Navigate to={getHomePathByRole(user.role)} replace />;
  }

  return children;
};
