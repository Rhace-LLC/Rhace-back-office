/**
 * Registry for module-level page caches (orders, notifications, dashboard…).
 *
 * Those caches live outside React and survive logout, so without this a
 * different user signing in on the same tab could briefly see the previous
 * user's data. Each cache registers a reset function; AuthContext calls
 * `resetSessionCaches()` on login and logout.
 */
const resetters = new Set<() => void>();

export const registerSessionCache = (reset: () => void) => {
  resetters.add(reset);
};

export const resetSessionCaches = () => {
  resetters.forEach((reset) => reset());
};
