import { useEffect, useState } from "react";
import { LogOut, MoreHorizontal, FileCheck } from "lucide-react";
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
import { useAuthStore } from "@/store/authStore";
import { useOfficerStore } from "@/store/officerStore";

const sidebarItems = [{ key: "assigned", label: "Assigned Docs", icon: FileCheck }];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const OfficerPage = () => {
  const [actionOpen, setActionOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState(null);
  const [signOpen, setSignOpen] = useState(false);
  const [signingRequest, setSigningRequest] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const authLoading = useAuthStore((state) => state.loading);

  const requests = useOfficerStore((state) => state.requests);
  const getRequests = useOfficerStore((state) => state.getRequests);
  const rejectRequest = useOfficerStore((state) => state.rejectRequest);
  const signRequest = useOfficerStore((state) => state.signRequest);
  const downloadRequestPdf = useOfficerStore((state) => state.downloadRequestPdf);

  useEffect(() => {
    getRequests();
  }, [getRequests]);

  const handleLogout = async () => {
    const response = await logout();
    if (response.success) {
      toast.success(response.message);
      navigate("/login", { replace: true });
      return;
    }
    toast.error(response.message || "Logout failed");
  };

  const handleDownload = async (request) => {
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

  const handleReject = async (requestId) => {
    const response = await rejectRequest(requestId);
    if (!response.success) {
      toast.error(response.message || "Failed to reject");
      return;
    }
    toast.success(response.message || "Request rejected");
  };

  const openSignDialog = (request) => {
    setSigningRequest(request);
    setSignatureDataUrl("");
    setSignOpen(true);
  };

  const handleSignatureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSignatureDataUrl("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSignatureDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSignature = async () => {
    if (!signatureDataUrl || !signingRequest) {
      toast.error("Upload a signature image first.");
      return;
    }

    const response = await signRequest(signingRequest._id, signatureDataUrl);
    if (!response.success) {
      toast.error(response.message || "Failed to sign");
      return;
    }
    toast.success(response.message || "Signed successfully");
    setSignOpen(false);
  };

  const openActionDialog = (request) => {
    setActionRequest(request);
    setActionOpen(true);
  };

  const openRejectConfirm = (requestId) => {
    setActionOpen(false);
    setPendingRejectId(requestId);
    setConfirmOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!pendingRejectId) return;
    await handleReject(pendingRejectId);
    setConfirmOpen(false);
    setPendingRejectId(null);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar variant="inset" collapsible="offcanvas">
          <SidebarHeader className="px-4 pt-4 pb-0">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]">Officer</p>
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
                    Officer
                  </p>
                  <h1 className="text-3xl font-semibold">Officer Dashboard</h1>
                  <p className="text-muted-foreground">
                    Review and sign the requests assigned to you.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                  {user?.email || "Officer"}
                </div>
                <Button onClick={handleLogout} variant="outline" disabled={authLoading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {authLoading ? <SpinnerCustom /> : "Sign Out"}
                </Button>
              </div>
            </section>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Assigned Requests</CardTitle>
                <CardDescription>Documents waiting for your signature.</CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                    No requests assigned yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="px-4 py-3 font-medium">Title</th>
                          <th className="px-4 py-3 font-medium">Court</th>
                          <th className="px-4 py-3 font-medium">Customer</th>
                          <th className="px-4 py-3 font-medium">Created</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request) => {
                          const courtLabel = request.details?.courtId
                            ? `${request.details.courtId.name} - ${request.details.courtId.location}`
                            : "-";
                          const canSign = request.status === "pending-sign";

                          return (
                            <tr key={request._id} className="border-b last:border-b-0">
                              <td className="px-4 py-3 font-medium">{request.title}</td>
                              <td className="px-4 py-3">{courtLabel}</td>
                              <td className="px-4 py-3">
                                {request.details?.customerName || "-"}
                              </td>
                              <td className="px-4 py-3">{formatDate(request.createdAt)}</td>
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

      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Upload signature</DialogTitle>
            <DialogDescription>
              Add a signature image to finalize this document.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="signatureFile">Signature image</Label>
              <Input
                id="signatureFile"
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
              />
            </div>
            {signatureDataUrl && (
              <div className="rounded-md border bg-muted/30 p-3">
                <img
                  src={signatureDataUrl}
                  alt="Signature preview"
                  className="max-h-32"
                />
              </div>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button onClick={handleSubmitSignature}>Attach signature</Button>
          </DialogFooter>
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
              onClick={() => {
                if (actionRequest) {
                  handleDownload(actionRequest);
                }
                setActionOpen(false);
              }}
            >
              Download template
            </Button>
            <Button
              className="w-full justify-start"
              disabled={actionRequest?.status !== "pending-sign"}
              onClick={() => {
                if (actionRequest) {
                  openSignDialog(actionRequest);
                }
                setActionOpen(false);
              }}
            >
              Sign document
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              disabled={actionRequest?.status !== "pending-sign"}
              onClick={() => openRejectConfirm(actionRequest?._id)}
            >
              Reject document
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reject this document?"
        description="The reader will be notified and the request will be marked rejected."
        confirmLabel="Reject"
        destructive
        onConfirm={handleConfirmReject}
      />
    </SidebarProvider>
  );
};

export default OfficerPage;
