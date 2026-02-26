import * as React from "react";
import { cn } from "./utils.js";

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "resize-none border-black/10 placeholder:text-black/40 flex min-h-16 w-full rounded-xl border bg-white/60 px-3 py-2 text-base text-black/90 backdrop-blur-md transition-[color,box-shadow,border-color] outline-none disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/40 md:text-sm",
        "focus-visible:border-black/20 focus-visible:ring-2 focus-visible:ring-black/20",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
