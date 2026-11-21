import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import React, { useEffect, useState } from "react";
import { LucideUserPlus, RefreshCcw } from "lucide-react";
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

  useEffect(() => {
    if (!allData) fetchAllStaffs();
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
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Staff"
          description="View, filter, and manage staff roles and invitations."
          actions={
            <>
              <Button onClick={() => setInviteSheetOpen(true)}>
                <LucideUserPlus /> Invite Staff
              </Button>
              <Button variant="outline" onClick={fetchAllStaffs}>
                <RefreshCcw /> Refresh
              </Button>
            </>
          }
        />

        {/*
          <StaffFilters filters={filters} setFilters={setFilters} onSearch={handleSearch} />
        */}

        {/* Table or Content */}
        <ContentHOC
          loading={fetchLoading}
          error={!!fetchError}
          noContent={toShow?.length === 0 || !toShow}
          loadingText="Fetching Staffs. Please Wait."
          noContentMessage="No Staffs found."
          noContentBtnText="Reload Staffs"
          noContentAction={fetchAllStaffs}
          errMessage={fetchError || "Failed to load Staffs."}
          actionFn={fetchAllStaffs}
        >
          <RenderEmployeeTable
            data={toShow || []}
            onRowClick={handleStaffClick}
          />
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
    </PageContainer>
  );
};

export default ManageStaff;
