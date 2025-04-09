export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  balance?: string;
  usdPrice: number;
  network?: string;
}

export interface Network {
  // id: string;
  chainId: number;
  name: string;
  logoURI?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}
