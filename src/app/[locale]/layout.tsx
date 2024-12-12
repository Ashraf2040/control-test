import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./_components/Footer";
import Header from "./_components/Header";

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Ensure you're fetching messages for the correct locale
  const messages = await getMessages(locale);

  return (
    <ClerkProvider>
      <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
        <body className="text-gray-900">
          {/* Wrap the entire layout with NextIntlClientProvider */}
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Header locale={locale} />
            <main>{children}</main>
            <ToastContainer />
            {/* <Footer />  Optional Footer */}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
