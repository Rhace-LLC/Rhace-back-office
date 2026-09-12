import { useEffect, useMemo, useRef, useState } from "react";
import {
  assignWaitersForTheDay,
  getWaitersTableAssignments,
  type Assignment,
} from "@/api-services/menu.service";
import { useAuth } from "@/contexts/AuthContext";
import { parseError } from "@/api-services/utils/parseError";

interface UseTableAssignmentsOptions {
  /** Fetch assignments on mount. Defaults to true. */
  autoFetch?: boolean;
  /** Run the daily auto-assignment when there are no assignments yet. */
  autoAssignOnEmpty?: boolean;
}

/**
 * Shared waiter-assignment state used by both the table management page
 * (read-only, for showing the assigned waiter on each table) and the
 * dedicated waiter assignment page (management).
 */
export function useTableAssignments({
  autoFetch = true,
  autoAssignOnEmpty = false,
}: UseTableAssignmentsOptions = {}) {
  const auth = useAuth();
  const tokenRef = useRef(auth.token);

  useEffect(() => {
    tokenRef.current = auth.token;
  }, [auth.token]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const fetchAssignments = async (
    autoAssign = false
  ): Promise<Assignment[]> => {
    setLoading(true);
    setError(null);

    try {
      let response = await getWaitersTableAssignments({}, {}, tokenRef.current);

      if (autoAssign && response.assignments.length === 0) {
        await assignWaitersForTheDay({}, {}, tokenRef.current);
        response = await getWaitersTableAssignments({}, {}, tokenRef.current);
      }

      setAssignments(response.assignments);
      return response.assignments;
    } catch (err) {
      setError(parseError(err) || "Unable to fetch waiters at the moment");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const setUpForToday = async () => {
    setSetupLoading(true);
    setSetupError(null);

    try {
      await assignWaitersForTheDay({}, {}, tokenRef.current);
      await fetchAssignments();
    } catch (err) {
      console.error("Failed to setup waiters for today", err);
      setSetupError(parseError(err) || "Unable to assign waiters for today");
    } finally {
      setSetupLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchAssignments(autoAssignOnEmpty);
    }
    // Intentionally runs once on mount; fetchAssignments reads the latest token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userAssignment = useMemo(
    () => assignments.find((assignment) => assignment.waiter.id === auth?.user?.id),
    [assignments, auth?.user?.id]
  );

  const tableWaiterMap = useMemo(() => {
    const map: Record<string, string> = {};
    assignments.forEach((assignment) =>
      assignment.tables.forEach((table) => {
        map[table.id] = assignment.waiter.name;
      })
    );
    return map;
  }, [assignments]);

  return {
    assignments,
    loading,
    error,
    setupLoading,
    setupError,
    userAssignment,
    tableWaiterMap,
    fetchAssignments,
    setUpForToday,
  };
}
