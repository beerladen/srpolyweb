"use client";

interface StatusDisplayProps {
  label: string;
}

export function BalanceDisplay({ label }: StatusDisplayProps) {
  return (
    <div className="flex items-center rounded-lg bg-muted px-3 py-1.5">
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
