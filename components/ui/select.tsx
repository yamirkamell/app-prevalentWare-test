import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-slate-900 ring-offset-white appearance-none cursor-pointer hover:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:border-indigo-500 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-100 disabled:hover:border-slate-300 shadow-sm hover:shadow-md",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {/* Icono de flecha personalizado */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-5 w-5 text-slate-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
