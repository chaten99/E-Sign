import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LogOut, MoreHorizontal, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CourtCombobox from "@/components/admin/CourtCombobox";
import { useAuthStore } from "@/store/authStore";
import { useReaderStore } from "@/store/readerStore";
import { SpinnerCustom } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sidebar,
  SidebarContent,
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

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString();
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString();
};

const sidebarItems = [{ key: "requests", label: "Requests", icon: FileText }];

const ReaderPage = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const authLoading = useAuthStore((state) => state.loading);

  const courts = useReaderStore((state) => state.courts);
  const requests = useReaderStore((state) => state.requests);
  const officers = useReaderStore((state) => state.officers);
  const getCourts = useReaderStore((state) => state.getCourts);
  const getRequests = useReaderStore((state) => state.getRequests);
  const createRequest = useReaderStore((state) => state.createRequest);
  const updateRequestDetails = useReaderStore((state) => state.updateRequestDetails);
  const sendForSignature = useReaderStore((state) => state.sendForSignature);
  const deleteRequest = useReaderStore((state) => state.deleteRequest);
  const getOfficersByCourt = useReaderStore((state) => state.getOfficersByCourt);
  const downloadRequestPdf = useReaderStore((state) => state.downloadRequestPdf);

  useEffect(() => {
    getCourts();
    getRequests();
  }, [getCourts, getRequests]);

  const createForm = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const detailsForm = useForm({
    defaultValues: {
      date: "",
      customerName: "",
      amount: "",
      dueDate: "",
      address: "",
      courtId: "",
      caseId: "",
    },
  });

  const handleCreateRequest = async (values) => {
    const response = await createRequest({
      title: values.title,
      description: values.description || "",
    });

    if (!response.success) {
      toast.error(response.message || "Failed to create request");
      return;
    }

    setCreateOpen(false);
    createForm.reset();
    toast.success(response.message || "Request created");
  };

  const openDetails = (request) => {
    if (request.status !== "draft") {
      toast.info("Details are locked after sending for signature.");
      return;
    }

    setActiveRequestId(request._id);
    detailsForm.reset({
      date: request.details?.date || "",
      customerName: request.details?.customerName || "",
      amount: request.details?.amount || "",
      dueDate: request.details?.dueDate || "",
      address: request.details?.address || "",
      courtId:
        request.details?.courtId?._id ||
        request.details?.courtId ||
        "",
      caseId: request.details?.caseId || "",
    });
    setDetailsOpen(true);
  };

  const handleSaveDetails = async (values) => {
    const response = await updateRequestDetails(activeRequestId, {
      date: values.date,
      customerName: values.customerName,
      amount: values.amount,
      dueDate: values.dueDate,
      address: values.address,
      courtId: values.courtId,
      caseId: values.caseId,
    });

    if (!response.success) {
      toast.error(response.message || "Failed to save request details");
      return;
    }

    setDetailsOpen(false);
    toast.success(response.message || "Request details saved");
  };

  const handleDownloadTemplate = async (request) => {
    const response = await downloadRequestPdf(request._id);
    if (!response.success) {
      toast.error(response.message || "Failed to download PDF");
      return;
    }

    const url = URL.createObjectURL(response.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${request.title.replace(/\s+/g, "-")}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openSendDialog = async (request) => {
    if (!request.detailsFilled) {
      toast.info("Fill request details before sending for signature.");
      return;
    }

    const courtId =
      request.details?.courtId?._id ||
      request.details?.courtId ||
      "";

    await getOfficersByCourt(courtId);
    setActiveRequestId(request._id);
    setSendOpen(true);
  };

  const handleSendForSign = async (officerId) => {
    const response = await sendForSignature(activeRequestId, officerId);
    if (!response.success) {
      toast.error(response.message || "Failed to send request");
      return;
    }

    setSendOpen(false);
    toast.success(response.message || "Sent for signature");
  };

  const handleRemoveRequest = async (requestId) => {
    const response = await deleteRequest(requestId);
    if (!response.success) {
      toast.error(response.message || "Failed to remove request");
      return;
    }

    toast.success(response.message || "Request removed");
  };

  const handleLogout = async () => {
    const response = await logout();

    if (response.success) {
      toast.success(response.message);
      navigate("/login", { replace: true });
      return;
    }

    toast.error(response.message || "Logout failed");
  };

  const openActionDialog = (request) => {
    setActionRequest(request);
    setActionOpen(true);
  };

  const openDeleteConfirm = (requestId) => {
    setActionOpen(false);
    setPendingDeleteId(requestId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    await handleRemoveRequest(pendingDeleteId);
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const availableOfficers = officers;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar variant="inset" collapsible="offcanvas">
          <SidebarHeader className="px-4 pt-4 pb-0">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Reader</p>
              <p className="text-lg font-semibold">Doc Sign</p>
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
                      <SidebarMenuButton isActive tooltip={item.label}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-6xl space-y-6 p-6 md:p-8 lg:p-10">
            <section className="flex flex-col gap-4 rounded-2xl border bg-background p-6 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <SidebarTrigger className="mt-1 md:hidden" />
                <div className="space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Reader
                  </p>
                  <h1 className="text-3xl font-semibold">Reader Dashboard</h1>
                  <p className="text-muted-foreground">
                    Create a new request and manage its signing flow.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                  {user?.email || "Reader"}
                </div>
                <Button onClick={handleLogout} variant="outline" disabled={authLoading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {authLoading ? <SpinnerCustom /> : "Sign Out"}
                </Button>
                <Button onClick={() => setCreateOpen(true)}>New Request</Button>
              </div>
            </section>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Requests</CardTitle>
                <CardDescription>All requests created by the reader.</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                    No requests yet. Create one to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Title</th>
                          <th className="px-4 py-3 font-medium">Documents</th>
                          <th className="px-4 py-3 font-medium">Rejected</th>
                          <th className="px-4 py-3 font-medium">Created</th>
                          <th className="px-4 py-3 font-medium">Last Activity</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => {
                          const canDownload = request.detailsFilled;
                          const canSend =
                            request.status === "draft" && request.detailsFilled;

                          return (
                            <tr key={request._id} className="border-b last:border-b-0">
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  className="text-left font-medium text-primary hover:underline"
                                  onClick={() => openDetails(request)}
                                >
                                  {request.title}
                                </button>
                              </td>
                              <td className="px-4 py-3">{request.docsCount}</td>
                              <td className="px-4 py-3">{request.rejectedCount}</td>
                              <td className="px-4 py-3">{formatDate(request.createdAt)}</td>
                              <td className="px-4 py-3">{formatDateTime(request.lastActivity)}</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium capitalize text-primary">
                                  {request.status.replace("-", " ")}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => openActionDialog(request)}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create new request</DialogTitle>
            <DialogDescription>Provide a title and optional description.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={createForm.handleSubmit(handleCreateRequest)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="requestTitle">Request title</Label>
              <Input
                id="requestTitle"
                placeholder="Enter request title"
                {...createForm.register("title", { required: "Title is required" })}
              />
              {createForm.formState.errors.title && (
                <p className="text-[0.8rem] font-medium text-destructive">
                  {createForm.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestDesc">Request description (optional)</Label>
              <Input
                id="requestDesc"
                placeholder="Add a short description"
                {...createForm.register("description")}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit">Create request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Request details</DialogTitle>
            <DialogDescription>Fill the details before sending for signature.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={detailsForm.handleSubmit(handleSaveDetails)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...detailsForm.register("date", { required: "Date is required" })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer name</Label>
                <Input id="customerName" placeholder="Customer name" {...detailsForm.register("customerName", { required: "Customer name is required" })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" placeholder="Amount" {...detailsForm.register("amount", { required: "Amount is required" })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" type="date" {...detailsForm.register("dueDate", { required: "Due date is required" })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Address" {...detailsForm.register("address", { required: "Address is required" })} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="courtId">Court</Label>
                <Controller
                  name="courtId"
                control={detailsForm.control}
                rules={{ required: "Court is required" }}
                render={({ field }) => (
                  <CourtCombobox
                    items={courts.map((court) => ({
                      id: court._id,
                      label: `${court.name} - ${court.location}`,
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a court"
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseId">Case ID</Label>
              <Input id="caseId" placeholder="Case ID" {...detailsForm.register("caseId", { required: "Case ID is required" })} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit">Save details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Send for signature</DialogTitle>
            <DialogDescription>Select an officer for this court.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {availableOfficers.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No officers available for the selected court.
              </div>
            ) : (
              availableOfficers.map((officer) => (
                <button
                  key={officer._id}
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left hover:bg-muted"
                  onClick={() => handleSendForSign(officer._id)}
                >
                  <div>
                    <p className="font-medium">{officer.name}</p>
                    <p className="text-xs text-muted-foreground">{officer.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {officer.courtId?.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Request actions</DialogTitle>
            <DialogDescription>
              {actionRequest?.title || "Choose an action"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={!actionRequest?.detailsFilled}
              onClick={() => {
                if (actionRequest) {
                  handleDownloadTemplate(actionRequest);
                }
                setActionOpen(false);
              }}
            >
              Download template
            </Button>
            <Button
              className="w-full justify-start"
              disabled={
                !actionRequest?.detailsFilled ||
                actionRequest?.status !== "draft"
              }
              onClick={() => {
                if (actionRequest) {
                  openSendDialog(actionRequest);
                }
                setActionOpen(false);
              }}
            >
              Send for sign
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => openDeleteConfirm(actionRequest?._id)}
            >
              Remove request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove this request?"
        description="This action cannot be undone."
        confirmLabel="Remove"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </SidebarProvider>
  );
};

export default ReaderPage;
