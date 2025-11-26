import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";
import { toast } from "sonner";
import { patchPassword } from "@/api-services/auth.service";
import { useAuth } from "@/contexts/AuthContext";

const SecuritySection: React.FC = () => {
  const auth = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    await patchPassword(auth.token, passwordForm);

    // Replace with API call later
    toast.success("Password changed successfully");

    setPasswordForm({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });

    setShowPasswordForm(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage your account security</CardDescription>
      </CardHeader>

      <CardContent>
        {!showPasswordForm ? (
          <div className="flex items-center justify-between">
            <div>
              <h4>Password</h4>
              <p className="text-muted-foreground text-sm">
                Last changed 30 days ago
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              <Key className="mr-1 h-4 w-4" />
              Change Password
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="old_password">Current Password</Label>
              <Input
                id="old_password"
                type="password"
                value={passwordForm.old_password}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    old_password: e.target.value,
                  }))
                }
                placeholder="Enter current password"
              />
            </div>

            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    new_password: e.target.value,
                  }))
                }
                placeholder="Enter new password"
              />
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirm_password: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleChangePassword} className="bg-[#2542e3]">
                Update Password
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecuritySection;
