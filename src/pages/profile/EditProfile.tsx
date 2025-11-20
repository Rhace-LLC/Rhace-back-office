import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { updateProfile as apiUpdateProfile, UserProfile } from "@/api-services/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setProfile } from "@/store/userSlice";

interface EditProfileProps {
  profile: UserProfile;
  onEdit: (val: boolean) => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ profile, onEdit }) => {
    const dispatch= useDispatch()
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone: profile.phone,
    restaurant: profile.restaurant || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await apiUpdateProfile(auth.token, form);
      dispatch(setProfile(response.data))
      

        toast.success("Profile updated successfully");
        onEdit(false);

    } catch (err: any) {
      toast.error(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full rounded-2xl shadow-sm">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600 mb-1">First Name</p>
            <Input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Last Name</p>
            <Input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Phone</p>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={loading} className="w-32">
            {loading ? "Saving..." : "Save"}
          </Button>

          <Button
            variant="outline"
            onClick={() => onEdit(false)}
            disabled={loading}
            className="w-32"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EditProfile;
