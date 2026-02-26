import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-black/10 bg-white/60 backdrop-blur-md">
        <Sparkles className="h-9 w-9 text-black/75" />
      </div>
      <h3 className="mb-2 text-black/90">No pulses yet</h3>
      <p className="max-w-sm text-center text-sm leading-relaxed text-black/55">
        Be the first to share how you're feeling. Pick a mood and let your pulse out — your community is listening.
      </p>
    </div>
  );
}
