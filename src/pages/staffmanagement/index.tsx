import React, { useEffect, useMemo, useState } from "react";
import {
  LucidePlus,
  LucideSearch,
  LucideMail,
  LucideUserPlus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { parseError } from "@/api-services/utils/parseError";
import { useAuth } from "@/contexts/AuthContext";
import { Pagination } from "@/components/pagination";
import { ContentHOC } from "@/components/nocontent";
import GenericSheet from "@/components/generic_sheet_overlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StaffAccount } from "@/store/staff.slice";
import RenderEmployeeTable from "./employee_table";
import InviteEmployeeForm from "./invite_employee";
import ViewEmployeeDetails from "./view_employee";

const ManageStaff: React.FC = () => {
  const auth = useAuth();
  const dispatch = useDispatch();

  // ---------------- State ----------------
  const [page, setPage] = useState(1);
  const [viewState, setViewState] = useState<"normal" | "search" | "filter">(
    "normal"
  );
  const [totalItems, setTotalItems] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [filters, setFilters] = useState({ searchTerm: "", role: "" });

  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [StaffSheetOpen, setStaffSheetOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);

  const dataStore = useSelector((state: RootState) => state.staff);
  const allData = dataStore.data;
  const page_size = 8;
  const total_pages = Math.ceil(totalItems / page_size);

  // ---------------- Derived Data ----------------
  const toShow = useMemo(() => allData[String(page)] ?? [], [allData, page]);

  // ---------------- API Call ----------------
  const fetchAllStaffs = async () => {
    try {
      setFetchLoading(true);
      setFetchError("");
      //const res = await getAllStaffs(auth.token);
      //dispatch(updateStaffAccount({ key: String(page), data: res }));
      //dispatch(updateStaffTotal({ data_total: 64 }));
      setTotalItems(64);
    } catch (error) {
      console.error(error);
      setFetchError(parseError(error) || "Failed to fetch Staffs.");
    } finally {
      setFetchLoading(false);
    }
  };

  // ---------------- Effects ----------------
  useEffect(() => {
    const pageData = allData[String(page)];
    if (!pageData) fetchAllStaffs();
  }, [page, allData]);

  useEffect(() => {
    //setTotalItems(dataStore.data_total);
  }, [dataStore]);

  // ---------------- Handlers ----------------
  const handleSearch = () => {
    if (filters.searchTerm.trim() !== "" || filters.role !== "") {
      setViewState("filter");
      // you can hook your filtered fetch here
    } else {
      setViewState("normal");
      fetchAllStaffs();
    }
  };

  const handleStaffClick = (Staff: StaffAccount) => {
    setSelectedStaff(Staff);
    setStaffSheetOpen(true);
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-6 p-5 md:mt-0">
      <div className="mx-auto space-y-6">
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
              Invite Staff
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 md:flex-row md:items-center md:gap-4">
          <div className="flex w-full items-center gap-2 md:w-1/3">
            <LucideSearch className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
            />
          </div>

          <Select
            value={filters.role}
            onValueChange={(value) => setFilters({ ...filters, role: value })}
          >
            <SelectTrigger className="w-full bg-white md:w-1/4">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>

          <Button className="w-full md:w-auto" onClick={handleSearch}>
            Apply
          </Button>
        </div>

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

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={total_pages}
          onPageChange={(p) => setPage(p)}
        />
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
