"use client";

import { Box, Server, Zap, Globe, Database, HardDrive, Cpu, MonitorSpeaker } from "lucide-react";

const iconItems = [
  { icon: Zap, color: "text-purple-500" },
  { icon: Server, color: "text-gray-400" },
  { icon: Box, color: "text-gray-400" },
  { icon: Globe, color: "text-gray-400" },
  { icon: Cpu, color: "text-gray-400" },
  { icon: HardDrive, color: "text-gray-400" },
  { icon: Database, color: "text-gray-400" },
  { icon: MonitorSpeaker, color: "text-gray-400" },
];

export function HubIconBanner() {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {iconItems.slice(0, 4).map((item, index) => (
        <div
          key={index}
          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${item.color}`}
        >
          <item.icon className="h-6 w-6" />
        </div>
      ))}
      <div className="w-4" />
      {iconItems.slice(4).map((item, index) => (
        <div
          key={index + 4}
          className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${item.color}`}
        >
          <item.icon className="h-6 w-6" />
        </div>
      ))}
    </div>
  );
}
