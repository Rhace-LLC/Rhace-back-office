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
import { Key, Eye, EyeOff } from "lucide-react";
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

  const [showPassword, setShowPassword] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
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

    toast.success("Password changed successfully");

    setPasswordForm({
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setShowPasswordForm(false);
  };

  const toggleShowPassword = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const renderPasswordInput = (
    id: keyof typeof passwordForm,
    label: string,
    placeholder: string
  ) => (
    <div className="relative">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={showPassword[id] ? "text" : "password"}
        value={passwordForm[id]}
        onChange={(e) =>
          setPasswordForm((prev) => ({ ...prev, [id]: e.target.value }))
        }
        placeholder={placeholder}
      />
      <button
        type="button"
        className="absolute right-2 top-[32px] -translate-y-1/2"
        onClick={() => toggleShowPassword(id)}
      >
        {showPassword[id] ? (
          <EyeOff className="h-4 w-4 text-gray-500 relative top-2" />
        ) : (
          <Eye className="h-4 w-4 text-gray-500 relative top-2" />
        )}
      </button>
    </div>
  );

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
            {renderPasswordInput("old_password", "Current Password", "Enter current password")}
            {renderPasswordInput("new_password", "New Password", "Enter new password")}
            {renderPasswordInput("confirm_password", "Confirm New Password", "Confirm new password")}

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