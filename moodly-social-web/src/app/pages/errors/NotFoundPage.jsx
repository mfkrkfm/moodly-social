import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">

      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-destructive mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/feed">Go Home</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}



