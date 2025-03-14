import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <UserButton />
        </header>

        <main className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Welcome to your dashboard
          </h2>
          <p>This is the tier 2 Application</p>
          <div>
            <Link href="/profile">Profile</Link>
            <Link href="/other">Other</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
