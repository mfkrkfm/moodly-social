import * as React from "react";
import { cn } from "./utils.js";

export function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div data-slot="card-content" className={cn("px-6 [&:last-child]:pb-6", className)} {...props} />
  );
}
