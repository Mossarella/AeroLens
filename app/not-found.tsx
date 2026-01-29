"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    // router.back(); // Navigate back to the previous page in history
    router.push("/");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 container mx-auto px-4 max-w-7xl text-sm text-balance min-h-0 bg-[url(/images/grilled-noise.png)]">
      <h2 className=" font-semibold">404 Not Found</h2>
      <p>Could not find the requested path :(</p>
      <Button
        onClick={() => {
          handleGoBack();
        }}
        className={cn(
          "mt-2 w-auto rounded-full bg-background hover:bg-primary hover:text-primary-foreground  "
        )}
        variant="outline"
      >
        Back to Home
      </Button>
    </div>
  );
}
