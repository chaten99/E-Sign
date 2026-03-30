import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHomePathByRole } from "@/lib/roleRoutes";
import { useAuthStore } from "@/store/authStore";

const Unauthorized = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleGoBack = () => {
    navigate(user ? getHomePathByRole(user.role) : "/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center text-center">
          <AlertTriangle className="mb-2 h-10 w-10 text-destructive" />
          <CardTitle className="text-xl font-bold">Unauthorized</CardTitle>
          <CardDescription>
            You do not have permission to view this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={handleGoBack}>Go Back</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
