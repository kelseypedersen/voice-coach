import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Confident Voice",
  description: "Confident Voice is a tool that helps you improve your voice and confidence.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <nav style={{
          display: "flex",
          alignItems: "center",
          padding: "24px 40px",
          background: "#fff",
          borderBottom: "1px solid #eee",
          marginBottom: 32,
          justifyContent: "space-between"
        }}>
          <div>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            {/* <Image
              src="/logo.svg" // or "/logo.png"
              alt="Confident Voice Logo"
              width={40}
              height={40}
              style={{ marginRight: 12 }}
            /> */}
            <span style={{ fontWeight: 700, fontSize: 22, color: "#222" }}>
              Confident Voice
            </span>
          </Link>
          </div>
          <div>
            <SignedOut>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <SignInButton className={`primary ${styles.primary}`} />
                <SignUpButton className={`primary ${styles.primary}`} />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
          {/* ...other nav links... */}
        </nav>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
