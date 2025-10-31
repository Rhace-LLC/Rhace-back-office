import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LucideMail } from "lucide-react";

interface Props {
  onSubmit: () => void;
}

const InviteEmployeeForm: React.FC<Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const handleGenerateLink = () => {
    const link = `https://example.com/invite/${btoa(email)}`;
    setInviteLink(link);
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <label className="block text-sm font-medium mb-1">Employee Email</label>
        <Input
          type="email"
          placeholder="Enter employee email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {inviteLink ? (
        <div className="bg-gray-50 p-3 rounded border text-sm">
          <p className="text-gray-600 mb-2">Invite Link:</p>
          <p className="break-all text-blue-600 underline">{inviteLink}</p>
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button onClick={handleGenerateLink} className="gap-2">
          <LucideMail className="h-4 w-4" />
          Generate Link
        </Button>
        {inviteLink && (
          <Button
            variant="secondary"
            onClick={onSubmit}
            className="gap-2"
          >
            Forward Invite
          </Button>
        )}
      </div>
    </div>
  );
};

export default InviteEmployeeForm;
