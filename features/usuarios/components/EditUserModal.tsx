"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useUpdateUser } from "../hooks/useUpdateUser";
import { updateUserSchema } from "../validators/user.validator";
import type { UpdateUserInput } from "../validators/user.validator";
import type { UserWithCounts } from "../types";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithCounts | null;
  onSuccess?: () => void;
}

interface FormErrors {
  name?: string;
  role?: string;
}

export function EditUserModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserModalProps) {
  const { updateUser, isLoading, error: updateError, reset } = useUpdateUser();
  const [formData, setFormData] = useState<UpdateUserInput>({
    name: "",
    role: "USER",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open && user) {
      reset();
      setFormData({
        name: user.name,
        role: user.role as "ADMIN" | "USER",
      });
      setErrors({});
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});

    const validationResult = updateUserSchema.safeParse(formData);
    if (!validationResult.success) {
      const fieldErrors: FormErrors = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await updateUser(user.id, validationResult.data);
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre completo"
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="USER">Usuario</option>
                <option value="ADMIN">Administrador</option>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role}</p>
              )}
            </div>

            {updateError && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{updateError}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
