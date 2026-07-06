"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface PodTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  author: string;
  authorType: "official" | "verified" | "community";
  icon?: string;
  iconColor?: string;
}

interface PodTemplateCardProps {
  template: PodTemplate;
  onClick?: () => void;
}

export function PodTemplateCard({ template, onClick }: PodTemplateCardProps) {
  const iconColorClass = template.iconColor || "text-orange-500";
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColorClass}`}>
          {template.icon === "runpod" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          ) : template.icon === "comfyui" ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-500" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {template.author}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
