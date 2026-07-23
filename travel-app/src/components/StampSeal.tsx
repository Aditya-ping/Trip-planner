import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface StampSealProps {
  label?: string;
  sublabel?: string;
  className?: string;
}

export default function StampSeal({
  label = "VERIFIED & CONFIRMED",
  sublabel = "AEROTRAVEL ISSUED",
  className = "",
}: StampSealProps) {
  return (
    <motion.div
      initial={{ scale: 1.8, opacity: 0, rotate: -15 }}
      animate={{ scale: 1, opacity: 0.9, rotate: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
      className={`inline-flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#C9A15A] text-[#C9A15A] bg-[#C9A15A]/5 rounded-md select-none pointer-events-none ${className}`}
      style={{ boxShadow: "0 0 12px rgba(201, 161, 90, 0.15)" }}
    >
      <div className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest border-b border-[#C9A15A]/40 pb-1">
        <ShieldCheck className="w-4 h-4 text-[#C9A15A]" />
        <span>{label}</span>
      </div>
      <div className="text-[8px] font-mono tracking-wider opacity-80 mt-1 uppercase">
        ★ {sublabel} ★
      </div>
    </motion.div>
  );
}
