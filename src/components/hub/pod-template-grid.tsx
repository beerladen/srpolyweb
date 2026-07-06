"use client";

import { PodTemplateCard, type PodTemplate } from "./pod-template-card";

interface PodTemplateGridProps {
  templates: PodTemplate[];
  onTemplateClick?: (template: PodTemplate) => void;
}

export function PodTemplateGrid({ templates, onTemplateClick }: PodTemplateGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {templates.map((template) => (
        <PodTemplateCard
          key={template.id}
          template={template}
          onClick={() => onTemplateClick?.(template)}
        />
      ))}
    </div>
  );
}
