import type { Metadata } from "next";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Cormorant_Garamond, DM_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Calia lab | Recalibra · Mapa de labs",
  description:
    "Sube tus exámenes de laboratorio y recibe un mapa por colores según los rangos funcionales.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  return (
    <ClerkProvider>
      <html
        lang="es-MX"
        className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {userId && (
            <header className="flex justify-end items-center px-4 sm:px-6 py-3 print:hidden">
              <UserButton />
            </header>
          )}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
