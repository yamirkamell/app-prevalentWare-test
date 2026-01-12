"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useCreateMovement } from "../hooks/useCreateMovement";
import { createMovementSchema } from "../validators/movement.validator";
import type { CreateMovementInput } from "../validators/movement.validator";

interface CreateMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId: string;
}

interface FormErrors {
  amount?: string;
  concept?: string;
  date?: string;
  type?: string;
}

export function CreateMovementModal({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: CreateMovementModalProps) {
  const { createMovement, isLoading, error: createError, reset } = useCreateMovement();
  const [formData, setFormData] = useState<CreateMovementInput>({
    amount: 0,
    concept: "",
    date: new Date().toISOString().split("T")[0],
    type: "INCOME",
    userId: userId,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      reset();
      setFormData({
        amount: 0,
        concept: "",
        date: new Date().toISOString().split("T")[0],
        type: "INCOME",
        userId: userId,
      });
      setErrors({});
    }
  }, [open, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
        
    setErrors({});
    setLocalError(null);
    reset();

    if (!formData.amount || formData.amount <= 0) {
      setErrors({ amount: "El monto debe ser mayor a 0" });
      return;
    }

    if (!formData.concept || formData.concept.trim() === "") {
      setErrors({ concept: "El concepto es requerido" });
      return;
    }

    if (!formData.date) {
      setErrors({ date: "La fecha es requerida" });
      return;
    }

    const validationResult = createMovementSchema.safeParse({
      ...formData,
      amount: Number(formData.amount),
    });
    
    if (!validationResult.success) {
      const fieldErrors: FormErrors = {};
      if (validationResult.error?.issues) {
        validationResult.error.issues.forEach((err) => {
          if (err.path && err.path[0]) {
            fieldErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      const dataToSubmit = {
        amount: validationResult.data.amount,
        concept: validationResult.data.concept,
        date: validationResult.data.date,
        type: validationResult.data.type,
        userId: userId,
      };
            
      await createMovement(dataToSubmit);
            
      onOpenChange(false);
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setLocalError(errorMessage);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount"
          ? parseFloat(value) || 0
          : name === "userId" && value === ""
          ? undefined
          : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento de Dinero</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount || ""}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Movimiento</Label>
              <Select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="INCOME">Ingreso</option>
                <option value="EXPENSE">Gasto</option>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                name="concept"
                value={formData.concept}
                onChange={handleChange}
                placeholder="Descripción del movimiento"
                required
              />
              {errors.concept && (
                <p className="text-sm text-red-500">{errors.concept}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {(createError || localError) && (
              <div className="rounded-md bg-red-50 p-3 md:col-span-2">
                <p className="text-sm text-red-800">{createError || localError}</p>
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
              {isLoading ? "Guardando..." : "Ingresar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
