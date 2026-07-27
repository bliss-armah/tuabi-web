import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function ServerStatusBanner() {
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    const down = () => setUnreachable(true);
    const up = () => setUnreachable(false);
    window.addEventListener("server:unreachable", down);
    window.addEventListener("server:reachable", up);
    return () => {
      window.removeEventListener("server:unreachable", down);
      window.removeEventListener("server:reachable", up);
    };
  }, []);

  if (!unreachable) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex flex-wrap items-center justify-center gap-3 bg-destructive px-4 py-2 text-center text-sm text-white shadow-md">
      <span className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        Can't reach the server. Please check your connection — some features are
        unavailable.
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-white/30"
      >
        Retry
      </button>
    </div>
  );
}
