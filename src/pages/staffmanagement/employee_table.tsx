import {
  StaffMember,
  toggleStaffAccountStatus,
} from "@/api-services/auth.service";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { useLoading } from "@/contexts/LoadingContext";
import { Power, PowerOff } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import ConfirmActionDialog from "./accountstatusconfirmation";
import { useDispatch } from "react-redux";
import { updateStaffDataById } from "@/store/staff.slice";

interface Props {
  data: StaffMember[];
  onRowClick: (employee: StaffMember) => void;
}

const RenderEmployeeTable: React.FC<Props> = ({ data, onRowClick }) => {
  const { setLoading, setLoadingText } = useLoading();
  const auth = useAuth();

  const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"enable" | "disable">("disable");
  const [loadingAction, setLoadingAction] = useState(false);
  const dispatch = useDispatch();

  const handleToggleClick = (
    employee: StaffMember,
    type: "enable" | "disable"
  ) => {
    setSelectedUser(employee);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedUser) return;
    try {
      setLoadingAction(true);
      setLoading(true);
      setLoadingText("Updating staff account...");

      const response = await toggleStaffAccountStatus(
        selectedUser.id,
        auth.token
      );

      dispatch(updateStaffDataById(response));

      toast.success(
        `Staff account ${actionType === "disable" ? "disabled" : "enabled"} successfully.`
      );
      setDialogOpen(false);
    } catch (error) {
      const errorMessage = parseError(error);
      toast.error(errorMessage || "Failed to update account status.");
    } finally {
      setLoading(false);
      setLoadingAction(false);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500 italic">
                No staff members found
              </td>
            </tr>
          ) : (
            data.map((employee) => (
              <tr
                key={employee.id}
                className="cursor-pointer transition hover:bg-gray-50"
                onClick={() => onRowClick(employee)}
              >
                <td className="p-3 font-medium">{employee.full_name}</td>
                <td className="p-3 text-gray-600">{employee.email}</td>
                <td className="p-3 text-gray-600">{employee.phone}</td>
                <td className="p-3 capitalize">{employee.role}</td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      employee.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {employee.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  {employee.is_active ? (
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-sm border-red-600 bg-red-100 px-6 py-2 text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleClick(employee, "disable");
                      }}
                    >
                      <PowerOff className="h-4 w-4 text-red-600" />
                      Disable
                    </button>
                  ) : (
                    <button
                      className="flex cursor-pointer items-center gap-2 rounded-sm border-green-600 bg-green-100 px-6 py-2 text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleClick(employee, "enable");
                      }}
                    >
                      <Power className="h-4 w-4 text-green-600" />
                      Enable
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Confirmation Dialog */}
      <ConfirmActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionType={actionType}
        onConfirm={handleConfirmToggle}
        loading={loadingAction}
      />
    </div>
  );
};

export default RenderEmployeeTable;
