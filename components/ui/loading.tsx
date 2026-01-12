import * as React from "react";
import { cn } from "@/lib/utils";

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ className, size = "md", text, ...props }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)} {...props}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "h-12 w-12 rounded-full",
    rectangular: "h-24 w-full rounded",
  };

  return (
    <div
      className={cn("animate-pulse bg-gray-200", variantClasses[variant], className)}
      {...props}
    />
  );
}
