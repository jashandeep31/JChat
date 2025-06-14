import { Card, CardContent } from "@repo/ui/components/card"
import { FeatureCardProps } from "./types"

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, children }) => (
  <Card className="bg-background/80 backdrop-blur-sm border-none shadow-sm text-center md:text-left">
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="p-2 bg-brand-purple rounded-full">
          <Icon className="w-5 h-5 text-brand-pink" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{children}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)
