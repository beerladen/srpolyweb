"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ConnectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function ConnectionCard({
  icon,
  title,
  description,
  connected = false,
  onConnect,
  onDisconnect,
}: ConnectionCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{title}</h4>
            <Button
              variant={connected ? "outline" : "secondary"}
              size="sm"
              onClick={connected ? onDisconnect : onConnect}
            >
              {connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
