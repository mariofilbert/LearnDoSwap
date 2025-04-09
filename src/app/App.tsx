'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { http, WagmiProvider } from 'wagmi';
import { sepolia, eduChainTestnet, arbitrumSepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

const config = getDefaultConfig({
  appName: 'LearnDoSwap',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
  chains: [sepolia, eduChainTestnet, arbitrumSepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
  transports: {
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARB_SEPOLIA_RPC_URL),
    [eduChainTestnet.id]: http(
      process.env.NEXT_PUBLIC_EDUCHAIN_TESTNET_RPC_URL
    ),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC_URL),
  },
});

const queryClient = new QueryClient();
const App = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
