import { useEffect, useMemo, useState } from "react";
import {
  BookOpenText,
  FileText,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Scale,
  Shield,
  SidebarIcon,
  UserCheck,
  UserCircle2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useAdminStore } from "@/store/adminStore";
import { SpinnerCustom } from "@/components/ui/spinner";
import CreateCourtDialog from "@/components/admin/CreateCourtDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "courts", label: "Courts", icon: Scale },
  { key: "officers", label: "Officers", icon: UserCheck },
  { key: "readers", label: "Readers", icon: Users },
  { key: "documents", label: "Documents", icon: FileText },
];

const sectionMeta = {
  dashboard: {
    title: "Dashboard Overview",
    description: "Track the main admin counts and navigate to the section you need.",
  },
  courts: {
    title: "Courts",
    description: "View the courts currently available in the system.",
  },
  officers: {
    title: "Officers",
    description: "View and manage officer accounts.",
  },
  readers: {
    title: "Readers",
    description: "View and manage reader accounts.",
  },
  documents: {
    title: "Documents",
    description: "Document management is not connected yet.",
  },
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [courtDialogOpen, setCourtDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("reader");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);


  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const authLoading = useAuthStore((state) => state.loading);

  const dashboardDetails = useAdminStore((state) => state.dashboardDetails);
  const courts = useAdminStore((state) => state.courts);
  const officers = useAdminStore((state) => state.officers);
  const readers = useAdminStore((state) => state.readers);
  const requests = useAdminStore((state) => state.requests);
  const adminLoading = useAdminStore((state) => state.loading);
  const dashboardError = useAdminStore((state) => state.error);
  const fetchDashboardDetails = useAdminStore((state) => state.fetchDashboardDetails);
  const getCourts = useAdminStore((state) => state.getCourts);
  const getOfficers = useAdminStore((state) => state.getOfficers);
  const getReaders = useAdminStore((state) => state.getReaders);
  const getRequests = useAdminStore((state) => state.getRequests);
  const deleteUser = useAdminStore((state) => state.deleteUser);
  const deleteCourt = useAdminStore((state) => state.deleteCourt);

  useEffect(() => {
    fetchDashboardDetails();
  }, [fetchDashboardDetails]);

  const handleLogout = async () => {
    const response = await logout();

    if (response.success) {
      toast.success(response.message);
      navigate("/login", { replace: true });
      return;
    }

    toast.error(response.message || "Logout failed");
  };

  const handleSectionChange = async (sectionKey) => {
    setActiveSection(sectionKey);

    if (sectionKey === "dashboard") {
      await fetchDashboardDetails();
      return;
    }

    if (sectionKey === "courts") {
      await getCourts();
      return;
    }

    if (sectionKey === "officers") {
      await getOfficers();
      return;
    }

    if (sectionKey === "readers") {
      await getReaders();
      return;
    }

    if (sectionKey === "documents") {
      await getRequests();
    }
  };

  const openCreateDialog = () => {
    if (activeSection === "courts") {
      setCourtDialogOpen(true);
      return;
    }

    const role = activeSection === "officers" ? "officer" : "reader";
    setSelectedRole(role);
    setUserDialogOpen(true);
  };

  const handleDeleteUser = async (row, roleLabel) => {
    const response = await deleteUser(row._id, roleLabel);
    if (!response.success) {
      toast.error(response.message || "Delete failed");
      return;
    }

    toast.success(response.message);
    await fetchDashboardDetails();
  };

  const handleDeleteCourt = async (row) => {
    const response = await deleteCourt(row._id);
    if (!response.success) {
      toast.error(response.message || "Delete failed");
      return;
    }

    toast.success(response.message);
    await fetchDashboardDetails();
  };


  const handleActiveSection = async () => {
    await fetchDashboardDetails();

    if (activeSection === "officers") {
      await getOfficers();
      return;
    }

    if (activeSection === "readers") {
      await getReaders();
    }

    if(activeSection === "courts") {
      await getCourts();
    }

    if (activeSection === "documents") {
      await getRequests();
    }
  };

  const openDeleteConfirm = (payload) => {
    setPendingDelete(payload);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "court") {
      await handleDeleteCourt(pendingDelete.row);
    } else {
      await handleDeleteUser(pendingDelete.row, pendingDelete.role);
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  };

  const stats = [
    {
      title: "Courts",
      value: dashboardDetails.courtCount,
      description: "Open the court list",
      icon: Scale,
      onClick: () => handleSectionChange("courts"),
    },
    {
      title: "Officers",
      value: dashboardDetails.officerCount,
      description: "Open the officer list",
      icon: UserCheck,
      onClick: () => handleSectionChange("officers"),
    },
    {
      title: "Readers",
      value: dashboardDetails.readerCount,
      description: "Open the reader list",
      icon: Users,
      onClick: () => handleSectionChange("readers"),
    },
    {
      title: "Documents",
      value: dashboardDetails.documentCount,
      description: "Open the document section",
      icon: BookOpenText,
      onClick: () => handleSectionChange("documents"),
    },
  ];

  const officerColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "court",
        label: "Court",
        render: (item) =>
          item.courtId
            ? `${item.courtId.name} - ${item.courtId.location || "Location not set"}`
            : "-",
      },
      {
        key: "createdAt",
        label: "Created",
        render: (item) => formatDate(item.createdAt),
      },
    ],
    [],
  );

  const readerColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "court",
        label: "Court",
        render: (item) =>
          item.courtId
            ? `${item.courtId.name} - ${item.courtId.location || "Location not set"}`
            : "-",
      },
      {
        key: "createdAt",
        label: "Created",
        render: (item) => formatDate(item.createdAt),
      },
    ],
    [],
  );

  const courtColumns = useMemo(
    () => [
      {
        key: "fullName",
        label: "Court",
        render: (item) => `${item.name} - ${item.location}`,
      },
    ],
    [],
  );

  const currentSection = sectionMeta[activeSection];
  const showCreateButton =
    activeSection === "officers" ||
    activeSection === "readers" ||
    activeSection === "courts";

  const createButtonLabel =
    activeSection === "courts"
      ? "Add Court"
      : activeSection === "officers"
        ? "Add Officer"
        : "Add Reader";

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <button
                key={item.title}
                type="button"
                className="cursor-pointer text-left transition-transform hover:-translate-y-1"
                onClick={item.onClick}
              >
                <DashboardStatCard
                  title={item.title}
                  value={item.value}
                  description={item.description}
                  icon={item.icon}
                  loading={adminLoading}
                />
              </button>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
                <div className="rounded-full bg-primary/10 p-3">
                  <UserCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Active Session</CardTitle>
                  <CardDescription>Current admin profile details</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <dt className="font-medium text-muted-foreground">Full Name</dt>
                    <dd className="font-medium">{user?.name || "Not set"}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <dt className="font-medium text-muted-foreground">Email Address</dt>
                    <dd className="font-medium">{user?.email || "Unknown"}</dd>
                  </div>
                  <div className="flex items-center justify-between pb-2">
                    <dt className="font-medium text-muted-foreground">System Role</dt>
                    <dd className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
                      {user?.role || "Admin"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </section>
        </div>
      );
    }

    if (activeSection === "courts") {
      return (
        <AdminDataTable
          title="Court List"
          description="All courts available in the system."
          columns={courtColumns}
          rows={courts}
          loading={adminLoading}
          emptyMessage="No courts found."
          rowActions={[
            {
              label: "Delete court",
              onClick: (row) => openDeleteConfirm({ type: "court", row }),
            },
          ]}
        />
      );
    }

    if (activeSection === "officers") {
      return (
        <AdminDataTable
          title="Officer List"
          description="All officer accounts in the system."
          columns={officerColumns}
          rows={officers}
          loading={adminLoading}
          emptyMessage="No officers found."
          rowActions={[
            {
              label: "Delete officer",
              onClick: (row) => openDeleteConfirm({ type: "user", role: "officer", row }),
            },
          ]}
        />
      );
    }

    if (activeSection === "readers") {
      return (
        <AdminDataTable
          title="Reader List"
          description="All reader accounts in the system."
          columns={readerColumns}
          rows={readers}
          loading={adminLoading}
          emptyMessage="No readers found."
          rowActions={[
            {
              label: "Delete reader",
              onClick: (row) => openDeleteConfirm({ type: "user", role: "reader", row }),
            },
          ]}
        />
      );
    }

    if (activeSection === "documents") {
      const requestColumns = [
        { key: "title", label: "Title" },
        {
          key: "reader",
          label: "Reader",
          render: (item) => item.readerId?.email || item.readerId?.name || "-",
        },
        {
          key: "officer",
          label: "Officer",
          render: (item) =>
            item.assignedOfficerId?.email || item.assignedOfficerId?.name || "-",
        },
        {
          key: "status",
          label: "Status",
          render: (item) => item.status?.replace("-", " ") || "-",
        },
        {
          key: "createdAt",
          label: "Created",
          render: (item) => formatDate(item.createdAt),
        },
      ];

      return (
        <AdminDataTable
          title="Documents"
          description="All requests across the system."
          columns={requestColumns}
          rows={requests}
          loading={adminLoading}
          emptyMessage="No documents found."
        />
      );
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar variant="inset" collapsible="offcanvas">
          <SidebarHeader className="px-4 pt-4 pb-0">
            <div className="flex items-center gap-3 rounded-lg bg-primary/10 p-3 text-primary">
              <Shield className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="font-bold tracking-tight">Doc Sign</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  Admin Portal
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="mt-4 px-2">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarMenu>
                {sidebarItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={activeSection === item.key}
                        tooltip={item.label}
                        onClick={() => handleSectionChange(item.key)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <Button
              variant="secondary"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
              disabled={authLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {authLoading ? <SpinnerCustom /> : "Sign Out"}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-7xl space-y-8 p-6 md:p-8 lg:p-10">
            <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <SidebarTrigger className="mt-1 md:hidden" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {currentSection.title}
                  </h1>
                  <p className="mt-1 text-muted-foreground">
                    {currentSection.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground md:flex md:items-center md:gap-2">
                  <SidebarIcon className="h-4 w-4" />
                  <span>{user?.email || "Admin"}</span>
                </div>
                {showCreateButton && (
                  <Button onClick={openCreateDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {createButtonLabel}
                  </Button>
                )}
              </div>
            </header>

            {dashboardError && (
              <Card className="border-destructive/50 bg-destructive/10 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Data Unavailable</CardTitle>
                  <CardDescription className="text-destructive/80">
                    {dashboardError}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {renderContent()}
          </main>
        </SidebarInset>

        <CreateUserDialog
          open={userDialogOpen}
          onOpenChange={setUserDialogOpen}
          defaultRole={selectedRole}
          onSuccess={handleActiveSection}
        />
        <CreateCourtDialog
          open={courtDialogOpen}
          onOpenChange={setCourtDialogOpen}
          onSuccess={handleActiveSection}
        />
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Confirm delete"
          description="This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={handleConfirmDelete}
        />
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
