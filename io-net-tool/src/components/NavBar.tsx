"use client";
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "../../lib/utils/cn";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import { loginIsRequiredClient } from "../../lib/auth-client";
import { useSession } from "next-auth/react";
import UserAccount from "./UserAccount";

const NavBar = () => {
  const { data: session } = useSession();

  console.log(session);
  const appContext = useContext(AppContext);
  const { openPopup } = appContext;

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex text-white z-40 font-semibold">
            <span>ionet tool.</span>
          </Link>

          <div className="hidden items-center space-x-4 sm:flex">
            {!session ? (
              <Button>
                <Link href="/authChoise">Sign In</Link>
              </Button>
            ) : (
              <>
                <Button
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "lg",
                    })
                  )}
                  onClick={openPopup}
                >
                  <span className="font-medium text-black">
                    Connect to server
                  </span>
                </Button>

                <UserAccount />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default NavBar;
