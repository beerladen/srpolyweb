"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountBalanceCardProps {
  balance: number;
  spendLimit: number;
  currentSpendRate: number;
}

export function AccountBalanceCard({
  balance,
  spendLimit,
  currentSpendRate,
}: AccountBalanceCardProps) {
  return (
    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
      <CardHeader>
        <CardTitle className="text-base font-medium">Account balance</CardTitle>
        <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-background p-4">
            <p className="text-sm text-muted-foreground">Spend limit</p>
            <p className="text-lg font-semibold">${spendLimit}/ hr</p>
          </div>
          <div className="rounded-lg bg-background p-4">
            <p className="text-sm text-muted-foreground">Current spend rate</p>
            <p className="text-lg font-semibold">${currentSpendRate.toFixed(3)} / hr</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
