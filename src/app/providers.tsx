"use client";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider } from "styled-components";
import { theme } from "@/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  if (typeof window !== "undefined" && typeof indexedDB === "undefined") {
    // Polyfill indexedDB with a dummy object to avoid ReferenceError
    window.indexedDB = {} as IDBFactory;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
} 