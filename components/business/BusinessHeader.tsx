import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type BusinessHeaderProps = {
  business: {
    name: string;
    description: string | null;
    logo_url: string | null;
    plan: string;
    category: string | null;
  };
};

export function BusinessHeader({ business }: BusinessHeaderProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <Avatar className="h-32 w-32 rounded-xl">
            <AvatarImage
              src={business.logo_url ?? undefined}
              alt={business.name}
            />

            <AvatarFallback className="rounded-xl text-3xl">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col justify-center gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {business.name}
              </h1>

              {business.category && (
                <p className="text-muted-foreground text-lg">
                  {business.category}
                </p>
              )}
            </div>

            {business.plan === "premium" && (
              <div>
                <Badge>Premium</Badge>
              </div>
            )}

            {business.description && (
              <p className="max-w-3xl leading-7 text-muted-foreground">
                {business.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
