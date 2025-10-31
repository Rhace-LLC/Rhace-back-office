import { StaffAccount } from "@/store/staff.slice";
import React from "react";

interface Props {
  data: StaffAccount[];
  onRowClick: (employee: StaffAccount) => void;
}

const RenderEmployeeTable: React.FC<Props> = ({ data, onRowClick }) => {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((employee) => (
            <tr
              key={employee.id}
              className="cursor-pointer hover:bg-gray-50 transition"
              onClick={() => onRowClick(employee)}
            >
              <td className="p-3 font-medium">{employee.first_name} {employee.last_name}</td>
              <td className="p-3 text-gray-600">{employee.email}</td>
              <td className="p-3 capitalize">{employee.role}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    employee.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {employee.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RenderEmployeeTable;
