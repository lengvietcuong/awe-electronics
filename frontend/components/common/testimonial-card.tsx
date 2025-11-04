import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TestimonialCardProps {
  quote: string;
  name: string;
}

export function TestimonialCard({ quote, name }: TestimonialCardProps) {
  return (
    <Card className="h-full border-border/60">
      <CardHeader>
        <p className="text-sm text-muted-foreground">“{quote}”</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-semibold text-foreground">{name}</p>
      </CardContent>
    </Card>
  );
}
