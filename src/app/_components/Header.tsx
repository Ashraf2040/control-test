"use client";

import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { usePathname } from "next/navigation";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const Header = () => {
  const color = useMotionValue(COLORS_TOP[0]);

  const pathName = usePathname();

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  const isHomePage = pathName === "/"; // Check if on the home page
  const headerBackground = isHomePage ? "bg-transparent" : "bg-main";

  return (
    <header
      className={` w-[98%] rounded-lg h-[70px] px-4 md:px-8 lg:px-12 flex justify-between mt-2 items-center print:hidden ${headerBackground} absolute z-10 top-0`}
    >
      <Link
        href="/"
        className="ring-4 ring-offset-2 ring-offset-black ring-purple-900 rounded-full"
      >
        <Image
          src="/forqan.jpg"
          alt="Logo"
          width={800}
          height={800}
          className="w-12 h-12 rounded-full"
        />
      </Link>

      <div className="text-end items-center">
        <SignedOut>
          <SignInButton>
            <motion.button
              style={{
                border,
                boxShadow,
              }}
              whileHover={{
                scale: 1.015,
              }}
              whileTap={{
                scale: 0.985,
              }}
              className={`${
                isHomePage ? "bg-transparent" : ""
              } group relative flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50`}
            >
              Login
            </motion.button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
