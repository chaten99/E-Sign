import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAdminStore } from "@/store/adminStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpinnerCustom } from "../ui/spinner";

export default function CreateCourtDialog({
  open,
  onOpenChange,
  onSuccess,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
    },
  });

  const createCourt = useAdminStore((state) => state.createCourt);
  const loading = useAdminStore((state) => state.loading);

  useEffect(() => {
    if (!open) {
      return;
    }

    reset({
      name: "",
      location: "",
    });
  }, [open, reset]);

  const onSubmit = async (values) => {
    const response = await createCourt(values);

    if (!response.success) {
      toast.error(response.message || "Failed to create court.");
      return;
    }

    toast.success(response.message || "Court created successfully.");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Court</DialogTitle>
          <DialogDescription>
            Add a court with its name and location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter court name"
              {...register("name", {
                required: "Court name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
            {errors.name && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Enter court location"
              {...register("location", {
                required: "Location is required",
                minLength: {
                  value: 2,
                  message: "Location must be at least 2 characters",
                },
              })}
            />
            {errors.location && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? <SpinnerCustom /> : "Create Court"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
