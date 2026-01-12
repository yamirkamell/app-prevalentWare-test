import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2",
          {
            "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 shadow-md": variant === "default",
            "border-slate-400 bg-slate-300 text-slate-900 hover:bg-slate-400 hover:border-slate-500": variant === "secondary",
            "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700 shadow-md": variant === "destructive",
            "border-slate-400 bg-white text-slate-900 hover:bg-slate-50": variant === "outline",
            "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 shadow-md": variant === "success",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
