"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HubSearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function HubSearchBar({ placeholder = "What are you looking for?", onSearch }: HubSearchBarProps) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-10 pr-4 h-12 rounded-full border-2"
        onChange={(e) => onSearch?.(e.target.value)}
      />
    </div>
  );
}
