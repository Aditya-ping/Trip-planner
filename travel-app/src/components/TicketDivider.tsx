import React from "react";

interface TicketDividerProps {
  className?: string;
}

export default function TicketDivider({ className = "" }: TicketDividerProps) {
  return (
    <div className={`relative my-6 w-full flex items-center ${className}`}>
      {/* Left Perforated Notch */}
      <div className="absolute -left-4 w-5 h-5 rounded-full bg-[#0B0F1A] border-r border-[#C9A15A]/30 shrink-0 z-10" />

      {/* Dashed Perforation Line */}
      <div className="w-full border-t border-dashed border-[#C9A15A]/30 my-auto" />

      {/* Right Perforated Notch */}
      <div className="absolute -right-4 w-5 h-5 rounded-full bg-[#0B0F1A] border-l border-[#C9A15A]/30 shrink-0 z-10" />
    </div>
  );
}
