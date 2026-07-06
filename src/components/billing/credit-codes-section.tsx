"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CreditCodesSectionProps {
  onGenerateCode?: () => void;
}

export function CreditCodesSection({ onGenerateCode }: CreditCodesSectionProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Credit Codes</CardTitle>
        <Button onClick={onGenerateCode}>Generate Code</Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          No credit codes generated yet. Generate a code to share credits with team members.
        </p>
      </CardContent>
    </Card>
  );
}
