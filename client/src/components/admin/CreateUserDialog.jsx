import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAdminStore } from "@/store/adminStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourtCombobox from "@/components/admin/CourtCombobox";
import { SpinnerCustom } from "../ui/spinner";

export default function CreateUserDialog({
  open,
  onOpenChange,
  defaultRole,
  onSuccess,
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "reader",
      courtId: "",
    },
  });

  const createUser = useAdminStore((state) => state.createUser);
  const getCourts = useAdminStore((state) => state.getCourts);
  const courts = useAdminStore((state) => state.courts);
  const loading = useAdminStore((state) => state.loading);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: "",
      email: "",
      password: "",
      role: defaultRole || "reader",
      courtId: "",
    });
    getCourts();
  }, [open, defaultRole, reset, getCourts]);

  const onSubmit = async (values) => {
    const response = await createUser(values);

    if (!response.success) {
      toast.error(response.message || "Failed to create user");
      return;
    }

    toast.success(response.message);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
            />
            {errors.name && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email address" },
              })}
            />
            {errors.email && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
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
              <p className="text-[0.8rem] font-medium text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Controller
              name="role"
              control={control}
              rules={{ required: "Role is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reader">Reader</SelectItem>
                    <SelectItem value="officer">Officer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-[0.8rem] font-medium text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="courtId">Court</Label>
            <Controller
              name="courtId"
              control={control}
              rules={{ required: "Court is required" }}
              render={({ field }) => (
                <CourtCombobox
                  items={courts.map((court) => ({
                    id: court._id,
                    label: `${court.name} - ${court.location}`,
                    subtitle: "",
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  loading={loading && courts.length === 0}
                  placeholder="Select a court"
                />
              )}
            />
            {errors.courtId && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.courtId.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? <SpinnerCustom /> : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
