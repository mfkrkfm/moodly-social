import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mb-5 shadow-sm">
        <Sparkles className="w-9 h-9 text-[#1E4D4D]" />
      </div>
      <h3 className="mb-2 text-[#1E4D4D]">No pulses yet</h3>
      <p className="text-muted-foreground text-center max-w-sm text-sm leading-relaxed">
        Be the first to share how you're feeling. Pick a mood and let your pulse out — your community is listening.
      </p>
    </div>
  );
}
