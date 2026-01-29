"use client";

import * as React from "react";
import Link from "next/link";

import { Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Navbar() {
  return (
    <div className=" w-full  h-[64px]  container mx-auto px-4 max-w-7xl    ">
      <div className=" justify-between w-full flex h-16 items-center  mx-auto">
        <Link
          href="/"
          className="flex items-center space-x-2 w-auto h-full"
        >
          <div className="h-[36px] w-[36px] relative">
            <Image
              src={`/images/logo.svg`}
              alt="logo"
              layout="fill"
              objectFit="fit"
              className="h-full w-full "
            />
          </div>
          <span className="font-bold text-xl">AEROLENS</span>
        </Link>
        <div className=" h-full hidden sm:flex w-full items-center justify-center gap-x-6">
          <Link href="/services">
            <Button
              className=" p-0 "
              variant="link"
            >
              Services
            </Button>
          </Link>
          <Link href="/about-us">
            <Button
              className="  p-0 "
              variant="link"
            >
              About Us
            </Button>
          </Link>
          <Link href="/help-center">
            <Button
              className=" p-0"
              variant="link"
            >
              Help Center
            </Button>
          </Link>
        </div>

        <div className=" flex items-center space-x-4 h-full">
          <Link href="/contact">
            <Button
              className={cn(
                "mt-2 w-auto rounded-full bg-background hover:bg-primary hover:text-primary-foreground  "
              )}
              variant="outline"
            >
              <Phone className="mr-2 h-4 w-4" />
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
