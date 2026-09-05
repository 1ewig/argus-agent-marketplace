import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LeftSidebar } from "@/components/left-sidebar";
import { QueryProvider } from "@/components/providers/query-provider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Argus — Trading Assistant | Binance Agent OS",
  description: "Smart, human-centered trading assistant powered by Binance Agent OS",
  icons: {
    icon: "/icon.svg",
  },
};

const PRE_HYDRATION_SCRIPT = `
(function() {
  try {
    var storedTheme = localStorage.getItem('argus-theme');
    var theme = storedTheme === 'light' ? 'light' : 'dark';
    document.documentElement.classList.add(theme);

    var storedSidebar = localStorage.getItem('argus-sidebar-collapsed');
    if (storedSidebar === 'true') {
      document.documentElement.classList.add('sidebar-collapsed');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_SCRIPT }} />
      </head>
      <body className="h-full bg-theme-bg-base flex flex-row overflow-hidden">
        <QueryProvider>
          <LeftSidebar />
          <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
