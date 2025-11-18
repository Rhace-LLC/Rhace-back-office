import { StaffMember } from "@/api-services/auth.service";
import React from "react";
import { Mail, Phone, BadgeCheck, UserRound } from "lucide-react";

interface Props {
  employee: StaffMember;
}

/**
 * A reusable component to display the employee's active status with visual flair.
 * @param isActive Boolean indicating the staff member's active status.
 */
const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const statusText = isActive ? "Active" : "Inactive";
  const statusColor = isActive
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
  const dotColor = isActive ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColor} shadow-sm`}
    >
      <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColor}`}></span>
      {statusText}
    </div>
  );
};

const DetailItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <span className="mt-0.5 text-indigo-400">{icon}</span>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-medium break-all text-gray-900">{value}</p>
    </div>
  </div>
);

/**
 * Modern and beautiful component to display staff member details in a card format.
 */
const ViewEmployeeDetails: React.FC<Props> = ({ employee }) => {
  if (!employee) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-lg">
        No employee data available.
      </div>
    );
  }

  return (
    <div className="pt-10">
      {/* Header and Status */}
      <div className="mb-6 flex items-start justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl leading-tight font-semibold text-gray-900">
            {employee.first_name} {employee.last_name}
          </h1>
          <p className="text-md mt-1 font-normal text-indigo-600">
            {employee.role}
          </p>
        </div>
        <StatusBadge isActive={employee.is_active} />
      </div>

      {/* Contact Information Grid */}
      <div className="space-y-6">
        <h2 className="mb-4 border-b pb-2 text-lg font-bold text-gray-700">
          Contact & Role
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <DetailItem
            icon={<Mail size={18} />}
            label="Email Address"
            value={employee.email}
          />
          <DetailItem
            icon={<Phone size={18} />}
            label="Phone Number"
            value={employee.phone || "N/A"}
          />
          <DetailItem
            icon={<BadgeCheck size={18} />}
            label="Employee ID"
            value={employee.id}
          />
          <DetailItem
            icon={<UserRound size={18} />}
            label="Full Name (System)"
            value={employee.full_name || "N/A"}
          />
        </div>
      </div>

      <div className="py-10" />
    </div>
  );
};

export default ViewEmployeeDetails;
