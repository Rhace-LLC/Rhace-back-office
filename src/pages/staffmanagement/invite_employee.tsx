import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { LucideMail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { inviteStaff } from "@/api-services/auth.service";
import { UserRole } from "@/contexts/AuthContext";
import { parseError } from "@/api-services/utils/parseError";

interface Props {
  onSubmit: () => void;
}

const InviteEmployeeForm: React.FC<Props> = ({ onSubmit }) => {
  const auth = useAuth();
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "admin" as UserRole,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateLink = async () => {
    try {
      setLoading(true);

      const restaurantId = auth.restaurants?.[0]?.id;
      if (!restaurantId) {
        toast.error("No restaurant found for your account");
        return;
      }

      const response = await inviteStaff(restaurantId, formData, auth.token);

      if (response?.invite_link) {
        setInviteLink(response.invite_link);
        toast.success("Invite link generated successfully!");
        setFormData({
          id: "",
          email: "",
          first_name: "",
          last_name: "",
          phone: "",
          role: "admin" as UserRole,
        });
      } else {
        toast.success("Invitation sent successfully!");
      }
    } catch (error: any) {
      console.error(error);
      const message = parseError(error)
      toast.error(message || "Failed to generate invite link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Employee Email */}

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
              <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
              <SelectItem value="waiter">Waiter</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
              <SelectItem value="inventory_mgr">Inventory Manager</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Invite Link Display */}
      {inviteLink && (
        <div className="rounded border bg-gray-50 p-3 text-sm">
          <p className="mb-2 text-gray-600">Invite Link:</p>
          <p
            className="cursor-pointer break-all text-blue-600 underline"
            onClick={() => navigator.clipboard.writeText(inviteLink)}
          >
            {inviteLink}
          </p>
          <p className="mt-1 text-xs text-gray-400">(Click to copy link)</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleGenerateLink}
          className="w-full gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <LucideMail className="h-4 w-4" />
              Generate Link
            </>
          )}
        </Button>

        {inviteLink && (
          <Button variant="secondary" onClick={onSubmit} className="gap-2">
            Forward Invite
          </Button>
        )}
      </div>
    </div>
  );
};

export default InviteEmployeeForm;
