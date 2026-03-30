import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getHomePathByRole } from "@/lib/roleRoutes";

export const RootRedirect = () => {
  const user = useAuthStore((state) => state.user);

  return <Navigate to={user ? getHomePathByRole(user.role) : "/login"} replace />;
};
