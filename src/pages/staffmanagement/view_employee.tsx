
import { StaffMember } from "@/api-services/auth.service";
import React from "react";

interface Props {
  employee: StaffMember;
}

const ViewEmployeeDetails: React.FC<Props> = ({ employee }) => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">
          {employee.first_name} {employee.last_name}
        </h2>
        <p className="text-gray-500">{employee.email}</p>
      </div>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Role:</strong> {employee.role}
        </p>
        <p>
          <strong>Status:</strong> {employee.is_active}
        </p>
      </div>
    </div>
  );
};

export default ViewEmployeeDetails;
