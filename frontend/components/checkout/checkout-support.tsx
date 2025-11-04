import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export interface CheckoutSupportMessage {
  title: string;
  description: string;
  href?: string;
}

export interface CheckoutSupportProps {
  messages: CheckoutSupportMessage[];
}

export function CheckoutSupport({ messages }: CheckoutSupportProps) {
  if (!messages?.length) return null;

  return (
    <Card className="border-border/80">
      <CardContent className="space-y-4 p-6 text-sm text-muted-foreground">
        {messages.map((message) => (
          <div key={message.title} className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{message.title}</p>
            <p>{message.description}</p>
            {message.href ? (
              <Link href={message.href} className="text-xs font-medium text-primary hover:text-primary/80">
                Learn more
              </Link>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
