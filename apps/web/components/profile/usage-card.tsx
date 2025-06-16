import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";

interface UsageCardProps {
  used?: number;
  total?: number;
}

export const UsageCard = ({ used = 0, total = 20 }: UsageCardProps) => (
  <Card className="bg-background/80 backdrop-blur-sm border-none shadow-sm">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-baseline">
        <CardTitle className="text-sm font-semibold">Message Usage</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-medium text-foreground">Credits Usage</p>
        <p className="text-sm font-medium text-foreground">
          {used}/{total}
        </p>
      </div>
      <Progress
        value={(used / total) * 100}
        className="h-2 bg-brand-purple [&>div]:bg-brand-pink"
      />
      <p className="text-xs text-muted-foreground mt-2">
        {total - used} message{total - used !== 1 ? "s" : ""} remaining
      </p>
    </CardContent>
  </Card>
);
