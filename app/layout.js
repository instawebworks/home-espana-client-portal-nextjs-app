import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata = {
  title: "Home Espana Client Portal",
  description: "Document upload portal for Home Espana clients",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
