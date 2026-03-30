import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHomePathByRole } from "@/lib/roleRoutes";
import { useAuthStore } from "@/store/authStore";
import { SpinnerCustom } from "@/components/ui/spinner";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }) => {
    const response = await login(email, password);
    const message = response.message || "Something went wrong";

    if (!response.success) {
      toast.error(message);
      return;
    }

    toast.success(message);
    navigate(getHomePathByRole(response.user.role), { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-[420px] border-muted/60 shadow-xl">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mb-2 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-10"
                  placeholder="name@example.com"
                  {...register("email", { required: "Email is required" })}
                />
              </div>
              {errors.email && (
                <p className="text-sm font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="pl-10 pr-16"
                  placeholder="Enter your password"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="mt-6 h-11 w-full text-base" disabled={loading}>
              <LogIn className="mr-2 h-5 w-5" />
              {loading ? <SpinnerCustom /> : "Sign In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="mt-4 flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Sign in with the email and password assigned to you.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
