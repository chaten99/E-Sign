import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SpinnerCustom } from "../ui/spinner";

export const DashboardStatCard = ({ title, value, description, icon, loading }) => {
  const IconComponent = icon;

  return (
    <Card className="border-muted/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl font-semibold">
            {loading ? <SpinnerCustom /> : value}
          </CardTitle>
        </div>
        <div className="rounded-xl bg-primary/10 p-2">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
