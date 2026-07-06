"use client";

import { useState } from "react";
import { CreditCard, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const amounts = [150, 200, 250, 500];

export function AddCreditsSection() {
  const [selectedAmount, setSelectedAmount] = useState(200);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Choose an amount to add.</p>
          
          <div className="flex flex-wrap gap-2">
            {amounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "secondary" : "outline"}
                className="min-w-16"
                onClick={() => setSelectedAmount(amount)}
              >
                ${amount}
              </Button>
            ))}
            <Button variant="outline">Other</Button>
          </div>

          <div className="flex justify-end">
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <CreditCard className="h-4 w-4" />
              Pay with card
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
