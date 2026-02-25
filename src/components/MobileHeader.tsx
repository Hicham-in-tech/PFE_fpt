"use client";

import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

interface MobileHeaderProps {
  role: string;
  userName: string;
}

export default function MobileHeader({ role, userName }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="bg-white rounded-lg px-2 py-1 shadow-sm">
            <Image src="/fpt-logo.png" alt="FPT Logo" width={100} height={32} className="h-8 w-auto object-contain" />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="w-6 h-6 text-slate-700" />
        </Button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl animate-slide-in-right">
            <div className="absolute top-4 right-4 z-10">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-500 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-full overflow-y-auto" onClick={() => setIsOpen(false)}>
              <Sidebar role={role} userName={userName} isMobile />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
