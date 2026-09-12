/**
 * True when the app is running on a developer machine (Vite dev server or a
 * local hostname), regardless of the build mode. Used to expose local-only
 * debugging surfaces such as the Debug page.
 */
export const isLocalEnv = (): boolean => {
  if (typeof window === "undefined") return import.meta.env.DEV;

  const { hostname } = window.location;

  return (
    import.meta.env.DEV ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  );
};
