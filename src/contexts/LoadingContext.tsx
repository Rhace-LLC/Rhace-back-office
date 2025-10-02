import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react"; // shadcn uses lucide icons

interface LoadingContextProps {
  loading: boolean;
  loadingText: string;
  setLoading: (isLoading: boolean) => void;
  setLoadingText: (text: string) => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoadingState] = useState(false);
  const [loadingText, setLoadingTextState] = useState("Loading...");

  const setLoading = (isLoading: boolean) => {
    setLoadingState(isLoading);
    if (!isLoading) {
      setLoadingTextState("Loading...");
    }
  };

  const setLoadingText = (text: string) => {
    setLoadingTextState(text);
  };

  return (
    <LoadingContext.Provider
      value={{ loading, loadingText, setLoading, setLoadingText }}
    >
      {loading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center space-y-3 rounded-xl bg-white p-6 shadow-md">
            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            {loadingText && (
              <p className="text-sm text-gray-700">{loadingText}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
