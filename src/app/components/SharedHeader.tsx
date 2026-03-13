import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Bell, UserCircle2, ArrowLeftRight, Menu } from "lucide-react";
import { NotificationsPanel } from "./NotificationsPanel";

export function SharedHeader({ role, onMenuClick }: { role: 'Patient' | 'Doctor' | 'Admin', onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roleColors = {
    Patient: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Doctor: "bg-green-500/20 text-green-400 border-green-500/30",
    Admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0a1628]/90 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 w-full">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onMenuClick && (
              <button onClick={onMenuClick} className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors mr-2">
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect width="32" height="32" rx="8" fill="#00d4ff" fillOpacity="0.1" />
                <path d="M14 8H18V14H24V18H18V24H14V18H8V14H14V8Z" fill="#00d4ff" />
              </svg>
              <h1 className="text-xl font-bold font-['Sora'] tracking-tight hidden sm:block">
                Medi<span className="text-[#00d4ff]">Track</span>
              </h1>
            </div>

            <div className={`ml-4 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${roleColors[role]}`}>
              {role}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a1628]"></span>
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

            <button 
              onClick={() => navigate('/login')} 
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          </div>
        </div>
      </header>

      <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} role={role} />
    </>
  );
}