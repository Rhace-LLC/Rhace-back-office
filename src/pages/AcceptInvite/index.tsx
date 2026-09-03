import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// <-- adjust import path
import { parseError } from "@/api-services/utils/parseError";
import { Loader2Icon, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/api-services/auth.service";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleAccept = async () => {
    if (!inviteToken) {
      setError("No invite token provided.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const response = await acceptInvite(inviteToken);
      console.log("Invite Accepted:", response);

      setSuccess(true);
    } catch (err: unknown) {
      const message = parseError(err);
      setError(message || "Failed to accept invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically attempt acceptance when token is present
    if (inviteToken) {
      handleAccept();
    } else {
      setError("Invalid or missing invite token.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-page px-4 py-10">
      <div className="flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center space-y-6 rounded-[24px] border border-line bg-surface p-8 text-center shadow-md sm:p-10">
      {loading && (
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm font-medium text-ink-muted">
            Accepting your invite...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="font-medium text-ink-secondary">{error}</p>
          <Button variant="outline" onClick={handleAccept}>
            Retry
          </Button>
        </div>
      )}

      {!loading && success && (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
          <p className="font-medium text-ink-secondary">
            Invite accepted successfully! You may now log in.
          </p>
          <p className="max-w-md text-sm leading-5 text-ink-muted">
            Shortly, you will receive an email containing your temporary login
            credentials. Please make sure to change your password after you log
            in.
          </p>
          <div className="mt-5">
            <Button
              onClick={() => {
                navigate("/login");
              }}
              className="h-10 px-8"
            >
              Proceed to Login
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
