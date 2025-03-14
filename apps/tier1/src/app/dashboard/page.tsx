import { UserButton } from "@clerk/nextjs";
import Frame from "@/components/frame";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <UserButton />
        </header>

        <main className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tier 1 Application</h2>
          <p>This is for 'Tier 1' (highest tier customers)</p>
          <div className="flex flex-col items-center justify-center p-6 ">
            <h1 className={"text-purple-700 font-semibold"}>Framed App</h1>
            <Frame />
          </div>
        </main>
      </div>
    </div>
  );
}
