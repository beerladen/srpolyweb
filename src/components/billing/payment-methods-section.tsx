"use client";

import { CreditCard, Edit, Star, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PaymentMethod {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isPrimary?: boolean;
}

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  onAddMethod?: () => void;
  onEditMethod?: (id: string) => void;
  onSetPrimary?: (id: string) => void;
  onDeleteMethod?: (id: string) => void;
}

export function PaymentMethodsSection({
  methods,
  onAddMethod,
  onEditMethod,
  onSetPrimary,
  onDeleteMethod,
}: PaymentMethodsProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>My Payment Methods</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Payment methods associated with your PodCat account.
          </p>
        </div>
        <Button onClick={onAddMethod}>Add Payment Method</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment methods</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.map((method) => (
              <TableRow key={method.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="capitalize">{method.type}</span>
                    <span className="text-muted-foreground">•••• {method.last4}</span>
                    <span className="text-muted-foreground">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </span>
                    {method.isPrimary && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        Primary
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditMethod?.(method.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!method.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSetPrimary?.(method.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDeleteMethod?.(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
