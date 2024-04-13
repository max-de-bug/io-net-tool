"use client";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "../../lib/utils/cn";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import { loginIsRequiredClient } from "../../lib/auth";
import { useSession } from "next-auth/react";

const NavBar = () => {
  const appContext = useContext(AppContext);
  const { openPopup } = appContext;
  const { data: session } = useSession();

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex text-white z-40 font-semibold">
            <span>ionet tool.</span>
          </Link>

          <div className="hidden items-center space-x-4 sm:flex">
            <Button
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "sm",
                })
              )}
              onClick={openPopup}
            >
              <span className="font-medium text-black">Connect to server</span>
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
