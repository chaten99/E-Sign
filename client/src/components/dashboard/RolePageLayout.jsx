import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { SpinnerCustom } from "../ui/spinner";

export const RolePageLayout = ({ title, description }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);

  const handleLogout = async () => {
    const response = await logout();

    if (response.success) {
      toast.success(response.message);
      navigate("/login", { replace: true });
      return;
    }

    toast.error(response.message || "Logout failed");
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="flex flex-col gap-4 rounded-2xl border bg-background p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {title}
            </p>
            <h1 className="text-3xl font-semibold">{title} Dashboard</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <Button onClick={handleLogout} disabled={loading}>
            {loading ? <SpinnerCustom /> : "Logout"}
          </Button>
        </section>

       </div>
       </div>
  );
};
