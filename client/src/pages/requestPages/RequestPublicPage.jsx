import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { publicApi } from "@/api/publicApi";
import { SpinnerCustom } from "@/components/ui/spinner";
import { getApiErrorMessage } from "@/lib/apiError";

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const getBlobErrorMessage = async (error, fallback) => {
  const responseData = error?.response?.data;
  if (responseData instanceof Blob) {
    try {
      const text = await responseData.text();
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
    } catch {
      // ..
    }
  }
  return getApiErrorMessage(error, fallback);
};

const RequestPublicPage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequest = async () => {
      try {
        setLoading(true);
        const response = await publicApi.getRequest(id);
        setRequest(response.data.data?.request || null);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load request"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadRequest();
    }
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await publicApi.downloadRequestPdf(id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${request?.title || "request"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = await getBlobErrorMessage(err, "Failed to download PDF");
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle>Request not available</CardTitle>
            <CardDescription>{error || "This request could not be loaded."}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const courtLabel = request.details?.courtId
    ? `${request.details.courtId.name} - ${request.details.courtId.location}`
    : "-";

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{request.title}</CardTitle>
            <CardDescription>
              Status: {request.status.replace("-", " ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{request.details?.customerName || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">{request.details?.amount || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Case ID</p>
                <p className="font-medium">{request.details?.caseId || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Court</p>
                <p className="font-medium">{courtLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{request.details?.date || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{request.details?.dueDate || "-"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">{request.details?.address || "-"}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
              <span>Created: {formatDateTime(request.createdAt)}</span>
              <span>Last activity: {formatDateTime(request.lastActivity)}</span>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleDownload} className="w-full">
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default RequestPublicPage;
