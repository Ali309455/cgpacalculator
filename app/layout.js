import { Inter } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import { CalculatorProvider } from "./contexts/CalculatorContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "CGPA Calculator | Clinical Grade Simulator & Planner",
  description: "Calculate your CGPA and semester grades with clinical mathematical precision. Adjust sessional weights, customize university grading scales, and simulate target grades.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <AuthProvider>
            <CalculatorProvider>
              {children}
              <Toaster position="top-center" richColors />
            </CalculatorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

