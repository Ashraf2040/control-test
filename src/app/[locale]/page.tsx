"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Hero } from "./_components/Hero";
import Footer from "./_components/Footer";

export default function HomePage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Get translations for HomePage
  const t = useTranslations("HomePage");

  useEffect(() => {
    if (isLoaded && userId) {
      const role = user?.publicMetadata?.role as string | undefined;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "TEACHER") {
        router.push(`/teacher`);
      } else if (role === "STUDENT") {
        router.push(`/studentCertificate/${userId}`);
      }
    }
  }, [isLoaded, userId, user, router]);

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center text-white w-full h-full relative">
      <Hero />
      <div className="absolute md:right-0 bottom-0">
       
        <Footer />
      </div>
    </div>
  );
}
