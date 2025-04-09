import TokenSwapInterface from "@/components/token-swap-interface"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#020617] text-white">
      <div className="container px-4 py-8">
        <TokenSwapInterface />
      </div>
    </main>
  )
}

