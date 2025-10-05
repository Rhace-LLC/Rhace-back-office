import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./navigation";
import ErrorBoundary from "./pages/utils/ErrorBoundary";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <ErrorBoundary>
        <Provider store={store}>
          <ToastProvider>
            <LoadingProvider>
              <AuthProvider>
                <Navigation />
              </AuthProvider>
            </LoadingProvider>
          </ToastProvider>
        </Provider>
        <Toaster position="top-right" />
      </ErrorBoundary>
    </>
  );
}

export default App;
