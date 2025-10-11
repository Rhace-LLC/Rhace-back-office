import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  LogOut,
  Key,
  Edit,
} from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function Profile() {
  const auth = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name:  "",
    email: auth.email || "",
    phone: "+1 (555) 123-4567",
    address: "123 Restaurant St, Food City, FC 12345",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = () => {
    // In a real app, this would update the backend
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    // In a real app, this would update the backend
    toast.success("Password changed successfully");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordForm(false);
  };

  const handleLogout = () => {
    auth.logout();
    toast.success("Logged out successfully");
  };

  if (!auth) return null;

  const userInitials = ""
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mt-15 space-y-6 p-5 md:mt-0">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">
          Profile Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="mx-auto mb-4 h-24 w-24">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${"User Name"}`}
              />
              <AvatarFallback className="text-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{"User Name"}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Badge className="bg-[#2542e3]">{auth.accountType}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-muted-foreground h-4 w-4" />
              <span>{profileForm.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="text-muted-foreground h-4 w-4" />
              <span>{profileForm.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="text-muted-foreground h-4 w-4" />
              <span>{"Afternoon"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-xs">{profileForm.address}</span>
            </div>

            <Separator />

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="mr-1 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={auth.accountType} disabled />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profileForm.address}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="shift">Shift Schedule</Label>
              <Input id="shift" value={"Afternoon"} disabled />
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveProfile} className="bg-[#2542e3]">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
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
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
              >
                <Key className="mr-1 h-4 w-4" />
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
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

      {/* Account Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Days Active</CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">156</div>
            <p className="text-muted-foreground text-xs">Since joining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Orders Handled</CardTitle>
            <Badge className="text-xs">2,847</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">2,847</div>
            <p className="text-muted-foreground text-xs">Total processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Performance Rating</CardTitle>
            <span className="text-yellow-500">★</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">4.8/5</div>
            <p className="text-muted-foreground text-xs">Average rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">89h</div>
            <p className="text-muted-foreground text-xs">Hours worked</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
