import { StaffMember, StaffRoleGroup } from "@/api-services/auth.service";

export const flattenStaffByRole = (
  staffByRole: Record<string, StaffRoleGroup>
): StaffMember[] => {
  return Object.values(staffByRole)
    .flatMap((roleGroup) => roleGroup.staff)
    .filter(Boolean);
};
