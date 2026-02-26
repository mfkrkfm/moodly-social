import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button.jsx";

export function ErrorPage({ code = 500, message = null }) {
  const titles = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    500: "Internal Server Error",
    503: "Service Unavailable",
  };

  const descriptions = {
    400: "The request contains errors. Please check your input and try again.",
    401: "You are not authenticated. Please log in to continue.",
    403: "You do not have permission to access this page.",
    500: "An error occurred on the server. We are already working on fixing it.",
    503: "The service is temporarily unavailable. Please try again later.",
  };

  const title = titles[code] || "Something went wrong";
  const description =
    message || descriptions[code] || "An unexpected error occurred.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">

      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-destructive mb-4">{code}</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground mb-8">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/feed">Go Home</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}



