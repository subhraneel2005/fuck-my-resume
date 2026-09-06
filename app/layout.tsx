import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { GeistSans } from "geist/font/sans"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body className={cn`${GeistSans.className} dark`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
