"use client";
import { Loader2 } from "lucide-react";
import RhaceImage from "@/assets/Rhace-10.png";

/**
 * Full-screen branded loader used while the app decides where to route the
 * session (e.g. onboarding vs dashboard) so nothing flashes prematurely.
 */
export function FullScreenLoader({
  label = "Loading…",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-5">
        <img src={RhaceImage} alt="Rhace" className="h-auto w-24" />
        <div className="flex items-center gap-2.5 text-ink-muted">
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}
