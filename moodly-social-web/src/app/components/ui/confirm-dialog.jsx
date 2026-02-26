import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./button.jsx";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="glass w-full max-w-sm rounded-2xl p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-black/90">{title}</h3>
            {description && <p className="mt-1 text-sm text-black/60">{description}</p>}
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" className="control-pill" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? "destructive" : "default"}
                className="h-9 rounded-full px-4"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
