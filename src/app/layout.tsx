import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/components/Toast";
import SessionProvider from "@/providers/SessionProvider";
import ResolutionListener from "@/components/ResolutionListener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PredictCam - Cameras ao Vivo + Previsoes",
  description: "Assista cameras ao vivo do mundo inteiro e faca suas previsoes em tempo real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionProvider>
          <WalletProvider>
            <ToastProvider>
              <ResolutionListener />
              {children}
            </ToastProvider>
          </WalletProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
