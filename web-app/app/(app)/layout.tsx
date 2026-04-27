import { TopNav } from "@/components/top-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="bg-black min-h-screen p-4 sm:p-6">{children}</main>
    </>
  );
}
