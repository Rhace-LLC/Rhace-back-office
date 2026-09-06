"use client";
import { useState } from "react";
import { Trash2, UserCircle2 } from "lucide-react";
import { Field, StepActions, StepHeader } from "./ui";
import { obField } from "./tokens";
import { TeamData, TeamMemberDraft } from "./types";

const ROLES: { label: string; value: string }[] = [
  { label: "Manager", value: "admin" },
  { label: "Waiter", value: "waiter" },
  { label: "Kitchen", value: "kitchen" },
  { label: "Inventory Manager", value: "inventory_mgr" },
  { label: "Driver", value: "driver" },
  { label: "Admin", value: "admin" },
];

const roleLabel = (value: string) =>
  ROLES.find((r) => r.value === value)?.label ?? value;

const PERMISSION_HINT =
  "Permissions are applied automatically based on role — you can refine them later.";

export function Step4Team({
  ownerEmail,
  onContinue,
}: {
  ownerEmail: string;
  onContinue: (data: TeamData) => void;
}) {
  const [members, setMembers] = useState<TeamMemberDraft[]>([]);
  const [draft, setDraft] = useState<TeamMemberDraft>({
    name: "",
    contact: "",
    role: ROLES[0].value,
  });

  const addMember = () => {
    if (!draft.name.trim() || !draft.contact.trim()) return;
    setMembers((prev) => [...prev, { ...draft }]);
    setDraft({ name: "", contact: "", role: ROLES[0].value });
  };

  return (
    <>
      <StepHeader
        step="04"
        title="Who's running the restaurant?"
        subtitle="Invite your team and give everyone the right level of access."
      />

      {/* Owner row */}
      <div className="flex items-center justify-between gap-3 rounded-[16px] border border-line bg-cardfill px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
            <UserCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm leading-5 font-medium text-ink">
              You <span className="font-normal text-ink-muted">· {ownerEmail || "Owner"}</span>
            </p>
            <p className="text-xs leading-4 text-ink-muted">Owner — full access</p>
          </div>
        </div>
        <span className="rounded-[8px] bg-surface px-2.5 py-1 text-xs font-medium text-brand ring-1 ring-line">
          You
        </span>
      </div>

      {/* Invite form */}
      <div className="mt-6 rounded-[16px] border border-line bg-cardfill p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm leading-5 font-medium text-ink">
            Invite team member
          </p>
          <span className="text-xs text-ink-muted">
            {members.length} added
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="ob-m-name" label="Name">
            <input
              id="ob-m-name"
              className={`${obField} bg-surface`}
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
            />
          </Field>
          <Field id="ob-m-contact" label="Phone / Email">
            <input
              id="ob-m-contact"
              className={`${obField} bg-surface`}
              value={draft.contact}
              onChange={(e) =>
                setDraft((p) => ({ ...p, contact: e.target.value }))
              }
              placeholder="Phone or email"
            />
          </Field>
          <Field id="ob-m-role" label="Role">
            <select
              id="ob-m-role"
              className={`${obField} bg-surface`}
              value={draft.role}
              onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <button
          type="button"
          onClick={addMember}
          disabled={!draft.name.trim() || !draft.contact.trim()}
          className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-secondary disabled:pointer-events-none disabled:opacity-50"
        >
          Add Team Member
        </button>
        <p className="mt-3 text-xs leading-[17px] text-ink-subtle">
          {PERMISSION_HINT}
        </p>
      </div>

      {/* Added members */}
      {members.length > 0 && (
        <ul className="mt-4 space-y-2">
          {members.map((member, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-[12px] border border-line bg-surface px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {member.name}
                </p>
                <p className="truncate text-xs text-ink-muted">
                  {member.contact}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-[8px] bg-cardfill px-2.5 py-1 text-xs font-medium text-ink-secondary ring-1 ring-line">
                  {roleLabel(member.role)}
                </span>
                <button
                  type="button"
                  aria-label="Remove member"
                  onClick={() =>
                    setMembers((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-[8px] text-ink-subtle transition-colors hover:bg-line-subtle hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StepActions
        onContinue={() => onContinue({ members })}
        onSecondary={() => onContinue({ members: [] })}
        secondaryLabel="Skip for now"
      />
    </>
  );
}
