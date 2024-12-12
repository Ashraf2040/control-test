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
import LanguageSwitcher from "./LanguageSwitcher";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const Header = ({ locale }: { locale: string }) => {
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

  const isHomePage = pathName === `/${locale}`; // Check if on the home page
  const headerBackground = isHomePage ? "bg-transparent" : "";

  return (
    <header
      className={` w-[98%] rounded-lg h-[70px] px-4 md:px-8 lg:px-12 flex justify-between mt-2 items-center print:hidden ${headerBackground} absolute z-10 top-0zz`}
    >
      <Link
        href="/"
        className=""
      >
        <Image
          src="/forqan.jpg"
          alt="Logo"
          width={800}
          height={800}
          className="w-12 h-12 rounded-full"
        />
      </Link>

      <div className="text-end flex gap-8 items-center">
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
             {locale === "en" ? "Sign In" : "تسجيل الدخول"}
            </motion.button>
           
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
};

export default Header;
