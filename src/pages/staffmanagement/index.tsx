import React, { useEffect, useState } from "react";
import { LucideUserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { ContentHOC } from "@/components/nocontent";
import GenericSheet from "@/components/generic_sheet_overlay";
import { Button } from "@/components/ui/button";
import RenderEmployeeTable from "./employee_table";
import InviteEmployeeForm from "./invite_employee";
import ViewEmployeeDetails from "./view_employee";
import { getAllStaff, StaffMember } from "@/api-services/auth.service";
import { flattenStaffByRole } from "./extras";
import { updateStaffData } from "@/store/staff.slice";

const ManageStaff: React.FC = () => {
  const auth = useAuth();
  const dispatch = useDispatch();

  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  const [StaffSheetOpen, setStaffSheetOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const dataStore = useSelector((state: RootState) => state.staff);
  const allData = dataStore.data;

  // ---------------- Derived Data ----------------
  const toShow = allData;

  // ---------------- API Call ----------------
  const fetchAllStaffs = async () => {
    try {
      setFetchLoading(true);
      setFetchError("");

      // ✅ Fetch from API
      const res = await getAllStaff(auth.token);

      // ✅ Flatten staff_by_role into one array
      const allStaff = flattenStaffByRole(res.staff_by_role);

      // ✅ Update Redux store
      dispatch(updateStaffData(allStaff));
    } catch (error) {
      console.error(error);
      setFetchError(parseError(error) || "Failed to fetch Staffs.");
    } finally {
      setFetchLoading(false);
    }
  };

  // ---------------- Effects ----------------
  useEffect(() => {
    const pageData = allData;
    if (pageData.length === 0) fetchAllStaffs();
  }, [allData]);

  useEffect(() => {
    fetchAllStaffs();
  }, []);

  useEffect(() => {
    //setTotalItems(dataStore.data_total);
  }, [dataStore]);

  const handleStaffClick = (Staff: StaffMember) => {
    setSelectedStaff(Staff);
    setStaffSheetOpen(true);
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-6 p-5 md:mt-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="mt-4 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">
              Manage Staffs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View, filter, and manage Staff roles and invitations.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setInviteSheetOpen(true)}
            >
              <LucideUserPlus className="h-4 w-4" />
              Invite New Staff
            </Button>
          </div>
        </div>

        {/*
          <StaffFilters filters={filters} setFilters={setFilters} onSearch={handleSearch} />
        */}

        {/* Table or Content */}
        <ContentHOC
          loading={fetchLoading}
          error={!!fetchError}
          noContent={toShow.length === 0}
          loadingText="Fetching Staffs. Please Wait."
          noContentMessage="No Staffs found."
          noContentBtnText="Reload Staffs"
          noContentAction={fetchAllStaffs}
          errMessage={fetchError || "Failed to load Staffs."}
          actionFn={fetchAllStaffs}
        >
          <RenderEmployeeTable data={toShow} onRowClick={handleStaffClick} />
        </ContentHOC>
      </div>

      {/* Invite Staff Sheet */}
      <GenericSheet
        open={inviteSheetOpen}
        onOpenChange={setInviteSheetOpen}
        title="Invite Staff"
        subtitle="Add an email to generate an invite link or send invite directly."
      >
        <InviteEmployeeForm onSubmit={() => setInviteSheetOpen(false)} />
      </GenericSheet>

      {/* View Staff Sheet */}
      {selectedStaff && (
        <GenericSheet
          open={StaffSheetOpen}
          onOpenChange={setStaffSheetOpen}
          title="Staff Details"
          subtitle="View and manage Staff information"
        >
          <ViewEmployeeDetails employee={selectedStaff} />
        </GenericSheet>
      )}
    </div>
  );
};

export default ManageStaff;
