import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { registerEmployee } from "@/api-services/auth.service";

export type UserRole =
  | "admin"
  | "restaurant_owner"
  | "waiter"
  | "kitchen"
  | "inventory_mgr"
  | "driver";

const RegisterEmployeeForm: React.FC = () => {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "admin" as UserRole,
    is_verified: true,
    invitation_token: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await registerEmployee(formData);
      toast.success("Employee registered successfully!");
      console.log("✅ Response:", response);
      setFormData({
        id: "-1",
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        password: "",
        confirm_password: "",
        role: "admin",
        is_verified: true,
        invitation_token: "",
      });
    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error(error?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-lg space-y-4 rounded-lg bg-white py-11"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>First Name</Label>
          <Input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <Input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Confirm Password</Label>
          <Input
            name="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="md:col-span-2">
          <Label>Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, role: value as UserRole }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
              <SelectItem value="waiter">Waiter</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
              <SelectItem value="inventory_mgr">Inventory Manager</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label>Invitation Token (optional)</Label>
          <Input
            name="invitation_token"
            value={formData.invitation_token}
            onChange={handleChange}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Registering..." : "Register Employee"}
      </Button>
    </form>
  );
};

export default RegisterEmployeeForm;
