import { Avatar } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";

interface UserProfileProps {
  name: string;
  email: string;
  plan: string;
}

export const UserProfile = ({ name, email, plan }: UserProfileProps) => (
  <div className="flex flex-col items-center text-center">
    <Avatar className="w-28 h-28 mb-4 border-4 border-background shadow-md">
      <div className="w-full h-full rounded-full bg-brand-purple flex items-center justify-center">
        <span className="text-5xl font-bold text-background">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    </Avatar>
    <h1 className="text-2xl font-bold text-foreground">{name}</h1>
    <p className="text-muted-foreground mb-4">{email}</p>
    <Badge className="bg-brand-purple text-brand-pink border-brand-pink/20">
      {plan}
    </Badge>
  </div>
);
