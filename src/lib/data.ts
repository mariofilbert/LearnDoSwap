import type { Token, Network } from './types';
import { sepolia, eduChainTestnet, arbitrumSepolia } from 'wagmi/chains';

export const networks: Network[] = [
  {
    chainId: sepolia.id,
    name: 'Sepolia',
    logoURI: '/sepoliaEth.png',
  },
  {
    chainId: eduChainTestnet.id,
    name: 'Edu Chain Testnet',
    logoURI: '/educhainLogo.png',
  },
  {
    chainId: arbitrumSepolia.id,
    name: 'ARB Sepolia',
    logoURI: '/arbitrumSepolia.png',
  },
];

export const tokens: Token[] = [
  // Ethereum tokens
  {
    chainId: 11155111,
    address: '0x0daAe4993EFB4a5940eBb24E527584a939B3dBf9',
    name: 'T1 Token',
    symbol: 'T1',
    decimals: 18,
    logoURI: '/T1.jpg',

    usdPrice: 1,
    network: networks[0].name,
  },
  {
    chainId: 656476,
    address: '0x200a8D0E6c872FDE20B122B846DC17fB0E3f8f88',
    name: 'T1 Token',
    symbol: 'T1',
    decimals: 18,
    logoURI: '/T1.jpg',

    usdPrice: 1,
    network: networks[1].name,
  },
  {
    chainId: 421614,
    address: '0x1C70d89E4E415C03BBDf59Ed8E2d081aDf06a837',
    name: 'T1 Token',
    symbol: 'T1',
    decimals: 18,
    logoURI: '/T1.jpg',
    // balance: '0',
    usdPrice: 1,
    network: networks[2].name,
  },
];
