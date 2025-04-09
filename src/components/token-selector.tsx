'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from '@/components/icons';
import type { Token, Network } from '@/lib/types';
import { tokens, networks } from '@/lib/data';
import { cn } from '@/lib/utils';

interface TokenSelectorProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect: (token: Token, network?: Network) => void;
  selectedToken: Token | null;
  excludeToken: Token | null;
  title: string;
}

export default function TokenSelector({
  isOpen,
  setIsOpen,
  onSelect,
  selectedToken,
  excludeToken,
  title,
}: TokenSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  // Group tokens by symbol
  const tokensBySymbol = tokens.reduce((acc, token) => {
    if (!acc[token.symbol]) {
      acc[token.symbol] = [];
    }
    acc[token.symbol].push(token);
    return acc;
  }, {} as Record<string, Token[]>);

  const filteredTokenSymbols = Object.keys(tokensBySymbol)
    .filter(
      (symbol) =>
        symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tokensBySymbol[symbol][0].name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .filter((symbol) => {
      // If no token to exclude, show all tokens
      if (!excludeToken) return true;

      // If token symbol is different, include it
      if (symbol !== excludeToken.symbol) return true;

      // If symbol is the same, check if there are multiple tokens with this symbol
      if (tokensBySymbol[symbol].length > 1) {
        // Filter out only the specific token with the same address
        const hasOtherTokensWithSameSymbol = tokensBySymbol[symbol].some(
          (token) => token.address !== excludeToken.address
        );
        return hasOtherTokensWithSameSymbol;
      }

      // Exclude the token if it's the only one with this symbol
      return false;
    });

  const handleTokenClick = (symbol: string) => {
    // If there's only one network for this token, select it directly
    if (tokensBySymbol[symbol].length === 1) {
      onSelect(tokensBySymbol[symbol][0]);
      resetAndClose();
      return;
    }

    // Otherwise toggle the expanded state
    setExpandedToken(expandedToken === symbol ? null : symbol);
  };

  const handleNetworkSelect = (token: Token) => {
    onSelect(token);
    resetAndClose();
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setSearchTerm('');
    setExpandedToken(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetAndClose();
        else setIsOpen(true);
      }}
    >
      <DialogContent className="bg-gray-900 text-white border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or paste address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
          {filteredTokenSymbols.map((symbol) => {
            const tokensForSymbol = tokensBySymbol[symbol];
            const isExpanded = expandedToken === symbol;
            const networkCount = tokensForSymbol.length;

            return (
              <div key={symbol} className="mb-1">
                <button
                  onClick={() => handleTokenClick(symbol)}
                  className={cn(
                    'flex items-center justify-between w-full p-3 hover:bg-gray-800 rounded-lg',
                    isExpanded && 'bg-gray-800 rounded-b-none'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                      <img
                        src={
                          tokensForSymbol[0].logoURI ||
                          `/placeholder.svg?height=32&width=32&text=${symbol}`
                        }
                        alt={symbol}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{symbol}</div>
                      <div className="text-sm text-gray-400">
                        {tokensForSymbol[0].name}
                        {networkCount > 1 && ` · ${networkCount} networks`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <div>$0</div> */}
                    {networkCount > 1 && (
                      <ChevronDownIcon
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded ? 'transform rotate-180' : ''
                        )}
                      />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-gray-800 rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out">
                    {tokensForSymbol.map((token) => {
                      if (
                        excludeToken &&
                        token.address === excludeToken.address
                      )
                        return null;
                      const network = networks.find(
                        (n) => n.name === token.network
                      );
                      if (!network) return null;

                      return (
                        <button
                          key={token.address}
                          onClick={() => handleNetworkSelect(token)}
                          className="flex items-center justify-between w-full p-3 pl-14 hover:bg-gray-700 border-t border-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
                              <img
                                src={
                                  network.logoURI ||
                                  `/placeholder.svg?height=24&width=24&text=${network.name.substring(
                                    0,
                                    2
                                  )}`
                                }
                                alt={network.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">{network.name}</div>
                              <div className="text-sm text-gray-400">
                                {token.balance} {token.symbol}
                              </div>
                            </div>
                          </div>
                          <div>
                            {selectedToken?.address === token.address && (
                              <CheckIcon className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
