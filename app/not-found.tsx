"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // Navigate back to the previous page in history
  };

  return (
    <div className="flex flex-1 text-sm text-balance  h-full flex-col items-center justify-center gap-2">
      <h2 className=" font-semibold">404 Not Found</h2>
      <p>Could not find the requested path :(</p>
      <Button
        onClick={() => {
          handleGoBack();
        }}
        className={cn(
          "mt-2 w-full rounded-full bg-[var(--primary)] hover:bg-[var(--primary2)] text-[var(--black)]  "
        )}
        variant="outline"
      >
        Go Back
      </Button>
    </div>
  );
}
