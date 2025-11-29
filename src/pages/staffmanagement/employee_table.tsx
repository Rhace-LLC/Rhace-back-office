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

      await toggleStaffAccountStatus(selectedUser.id, auth.token);

      dispatch(
        updateStaffDataById({
          ...selectedUser,
          is_active: !selectedUser.is_active,
        })
      );

      toast.success(
        `Staff account ${actionType === "disable" ? "disabled" : "enabled"} successfully.`
      );

      setDialogOpen(false);
    } catch (error) {
      toast.error(parseError(error) || "Failed to update account status.");
    } finally {
      setLoading(false);
      setLoadingAction(false);
    }
  };

  return (
    <div className="">
      {/* Modern Scroll Wrapper */}
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        {/* Sticky Header */}
        <thead className="sticky top-0 z-10 border-b bg-gray-50">
          <tr className="text-gray-700">
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Email</th>
            <th className="p-3 font-medium">Phone</th>
            <th className="p-3 font-medium">Role</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 text-center font-medium">Action</th>
          </tr>
        </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500 italic"
                >
                  No staff members found
                </td>
              </tr>
            ) : (
              data.map((employee) => (
                <tr
                  key={employee.id}
                  className="cursor-pointer border-b transition-colors last:border-none hover:bg-gray-50"
                  onClick={() => onRowClick(employee)}
                >
                  <td className="p-3 font-medium text-gray-900">
                    {employee.full_name}
                  </td>

                  <td className="p-3 text-gray-600">{employee.email}</td>
                  <td className="p-3 text-gray-600">{employee.phone}</td>
                  <td className="p-3 capitalize">{employee.role}</td>

                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        employee.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    {employee.is_active ? (
                      <button
                        className="inline-flex items-center gap-2 rounded border border-red-600 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleClick(employee, "disable");
                        }}
                      >
                        <PowerOff className="h-4 w-4" />
                        Disable
                      </button>
                    ) : (
                      <button
                        className="inline-flex items-center gap-2 rounded border border-green-600 bg-green-50 px-4 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleClick(employee, "enable");
                        }}
                      >
                        <Power className="h-4 w-4" />
                        Enable
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
