"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface AutoPaySectionProps {
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function AutoPaySection({ enabled = false, onToggle }: AutoPaySectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">Auto-Pay</CardTitle>
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Configure automatic billing by adding a card to your account. When your balance nears your auto-pay threshold, we will attempt to reload PodCat credits by billing your default saved card max <strong>once per hour</strong> for the auto-pay amount that is configured below.
        </p>
      </CardContent>
    </Card>
  );
}
