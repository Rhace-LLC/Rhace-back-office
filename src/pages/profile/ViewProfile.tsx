import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { UserProfile } from "@/api-services/auth.service";

interface ViewProfileProps {
  profile: UserProfile;
  onEdit: (val: boolean) => void;
}

const ViewProfile: React.FC<ViewProfileProps> = ({ profile, onEdit }) => {
  return (
    <Card className="w-full rounded-2xl shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Profile Details
          </h2>
          <Button
            onClick={() => onEdit(true)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <p className="font-medium">{profile.first_name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <p className="font-medium">{profile.last_name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{profile.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{profile.phone}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium capitalize">{profile.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewProfile;
