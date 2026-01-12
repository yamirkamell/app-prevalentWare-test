import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg": variant === "default",
            "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg": variant === "destructive",
            "border-2 border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100": variant === "outline",
            "bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400": variant === "secondary",
            "hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200": variant === "ghost",
            "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
