import * as React from "react";
import { cn } from "./utils.js";

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-black/40 selection:bg-black selection:text-white border-black/10 flex h-9 w-full min-w-0 rounded-xl border bg-white/60 px-3 py-1 text-base text-black/90 backdrop-blur-md transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/40 md:text-sm",
        "focus-visible:border-black/20 focus-visible:ring-2 focus-visible:ring-black/20",
        className
      )}
      {...props}
    />
  );
}
