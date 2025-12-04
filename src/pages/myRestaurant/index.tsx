import { ContentHOC } from "@/components/nocontent";
import { useRestaurantProfile } from "./useRestaurantProfile";
import ViewMyRestaurant from "./ViewRestaurant";
import { useEffect, useState } from "react";
import EditRestaurantProfile from "./EditRestaurant";
import { useLoading } from "@/contexts/LoadingContext";
import {
  patchRestaurantProfile,
  RestaurantProfile,
  updateRestaurantProfile,
} from "@/api-services/restaurantProfile";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseError } from "@/api-services/utils/parseError";
import { useDispatch } from "react-redux";
import { updateProfile } from "@/store/restaurantProfile";

export default function RestaurantProfilePage() {
  const dispatch = useDispatch();
  const auth = useAuth();
  const { setLoading, setLoadingText } = useLoading();
  const { profile, loading, error, fetchProfile } = useRestaurantProfile();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, [profile]);

  const handleSaveUpdate = async (data: RestaurantProfile) => {
    try {
      setLoading(true);
      setLoadingText("Updating restaurant profile...");

      // ---------- 0. Sort opening_hours ----------
      const weekOrder: Record<string, number> = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
        sunday: 7,
      };

      const sortedOpeningHours = data.opening_hours
        ? [...data.opening_hours].sort(
            (a, b) =>
              (weekOrder[a.day.toLowerCase()] || 99) -
              (weekOrder[b.day.toLowerCase()] || 99)
          )
        : null;

      // ---------- 1. Update basic profile (JSON) ----------
      const { logo, cover_image, ...profileData } = {
        ...data,
        opening_hours: sortedOpeningHours,
      }; // replace opening_hours with sorted array

      let update1 = await updateRestaurantProfile(
        String(profile?.id),
        profileData,
        auth.token
      );

      dispatch(updateProfile(update1));

      // ---------- 2. Update images (FormData) ----------
      if (logo || cover_image) {
        setLoadingText("Uploading images...");

        const formData = new FormData();

        const appendImage = async (
          field: "logo" | "cover_image",
          value: any
        ) => {
          if (!value) return;

          if (value instanceof File) {
            formData.append(field, value);
          } else if (typeof value === "string" && value.startsWith("data:")) {
            // Convert base64 → Blob
            const res = await fetch(value);
            const blob = await res.blob();
            formData.append(field, blob, `${field}.png`);
          }
        };

        await appendImage("logo", logo);
        await appendImage("cover_image", cover_image);

        // Call the API again with FormData
        let update1 = await patchRestaurantProfile(
          String(profile?.id),
          formData,
          auth.token
        );
        dispatch(updateProfile(update1));
      }
      setEditMode(false);
      toast.success("Restaurant profile updated successfully!");
    } catch (error) {
      const errMsg = parseError(error);
      toast.error(errMsg || "Failed to update profile.");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  return (
    <div className="px-4">
      <ContentHOC
        loading={loading}
        error={!!error}
        noContent={!profile && !loading}
        loadingText="Fetching restaurant profile..."
        noContentMessage="No Profile Found"
        noContentBtnText="Reload"
        noContentAction={fetchProfile}
        errMessage={error}
      >
        {/* VIEW MODE */}
        {profile && !editMode && (
          <ViewMyRestaurant
            onEdit={(edit) => setEditMode(edit)}
            profile={profile}
          />
        )}

        {/* EDIT MODE */}
        {profile && editMode && (
          <EditRestaurantProfile
            onEdit={(edit) => setEditMode(edit)}
            profile={profile}
            onSave={(data) => {
              handleSaveUpdate(data);
            }}
          />
        )}
      </ContentHOC>
    </div>
  );
}
