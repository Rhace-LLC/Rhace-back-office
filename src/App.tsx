import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./navigation";
import ErrorBoundary from "./pages/utils/ErrorBoundary";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <ToastProvider>
              <LoadingProvider>
                <AuthProvider>
                  <Navigation />
                </AuthProvider>
              </LoadingProvider>
            </ToastProvider>
          </Provider>
        </QueryClientProvider>
        <Toaster position="top-right" />
      </ErrorBoundary>
    </>
  );
}

export default App;
