import { UserButton } from "@clerk/nextjs";

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
          <p>This is a protected page accessible only after authentication.</p>
        </main>
      </div>
    </div>
  );
}
