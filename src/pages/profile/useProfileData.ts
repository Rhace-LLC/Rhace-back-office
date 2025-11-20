import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { parseError } from "@/api-services/utils/parseError";
import { RootState } from "@/store/store";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile } from "@/api-services/auth.service";
import { setProfile } from "@/store/userSlice";

export const useProfile = () => {
  const dispatch = useDispatch();
  const auth = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pull profile from store (not loading/error)
  const profile = useSelector((state: RootState) => state.profile.profile);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getProfile(auth.token);
      dispatch(setProfile(res));
    } catch (err) {
      setError(parseError(err) || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
  };
};
