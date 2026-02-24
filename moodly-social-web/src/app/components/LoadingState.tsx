import { Card, CardContent } from "./ui/card";

export function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-32" />
                <div className="h-3 bg-muted rounded animate-pulse w-24" />
              </div>
              <div className="h-6 bg-muted rounded-full animate-pulse w-16" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            </div>
            <div className="flex gap-4">
              <div className="h-8 bg-muted rounded animate-pulse w-20" />
              <div className="h-8 bg-muted rounded animate-pulse w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
