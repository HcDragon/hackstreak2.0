import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster theme="dark" richColors position="top-right" />
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
