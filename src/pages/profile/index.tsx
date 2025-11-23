import { useState } from "react";
import EditProfile from "./EditProfile";
import { useProfile } from "./useProfileData";
import ViewProfile from "./ViewProfile";
import SecuritySection from "./Security";
import { ContentHOC } from "@/components/nocontent";

export const Profile = () => {
  const { profile, loading, error, fetchProfile } = useProfile();
  const [editing, setEditing] = useState(false);

  return (
    <div className="mt-3 space-y-10 px-6">
      <ContentHOC
        loading={loading}
        error={!!error}
        noContent={!profile}
        loadingText="Fetching profile..."
        noContentMessage="No profile found."
        noContentBtnText="Reload Profile"
        noContentAction={fetchProfile}
        errMessage={error || "Failed to load profile."}
        actionFn={fetchProfile}
      >
        {!editing ? (
          <ViewProfile profile={profile!} onEdit={setEditing} />
        ) : (
          <EditProfile profile={profile!} onEdit={setEditing} />
        )}
      </ContentHOC>

      {/* Security section is independent of ContentHOC */}
      <SecuritySection />
    </div>
  );
};
