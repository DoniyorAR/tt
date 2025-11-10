// app/layout.tsx
import "./globals.css";                // or "../styles/tailwind.css" if you used that
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export const metadata = {
  title: "Pyeongtaek Smart Platform",
  description: "G3/G7 initiatives · schedules · infrastructure · fusion",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="container-p py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
