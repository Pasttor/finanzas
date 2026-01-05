import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // 👈 ¡ESTA LÍNEA ES LA QUE FALTA O ESTÁ FALLANDO!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mis Finanzas",
  description: "Bot financiero inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}