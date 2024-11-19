import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import './globals.css';
import Image from 'next/image';
import Header from './_components/Header';
import Footer from './_components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="print:p-0 print:m-0 relative">
        <body className="text-gray-900 h-screen bg-cover flex flex-col items-center relative">
          <Header />
          <main className="mx-auto h-screen w-full bg-cover bg-center rounded">
            {children}
          </main>
          {/* Include the ToastContainer to display notifications */}
          <ToastContainer />
          {/* <Footer /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
