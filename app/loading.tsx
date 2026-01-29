import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 container mx-auto px-4 max-w-7xl text-sm text-balance min-h-0 ">
      <Loader2 className="w-4 h-4 animate-spin" />
    </div>
  );
}
