import { networks } from '@/lib/data';
import { Network } from '@/lib/types';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface NetworkSelectorProps {
  selectedNetwork: Network;
  setSelectedNetwork: (network: Network) => void;
}

export const CustomConnectButton = ({
  selectedNetwork,
  setSelectedNetwork,
}: NetworkSelectorProps) => {
  const [connectedChainId, setConnectedChainId] = useState<number | null>(null);
  const latestChainIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      latestChainIdRef.current &&
      latestChainIdRef.current !== connectedChainId
    ) {
      setConnectedChainId(latestChainIdRef.current);
    }
  });

  useEffect(() => {
    if (connectedChainId != null) {
      const matchingNetwork = networks.find(
        (n) => n.chainId === connectedChainId
      );
      if (
        matchingNetwork &&
        matchingNetwork.chainId !== selectedNetwork.chainId
      ) {
        setSelectedNetwork(matchingNetwork);
      }
    }
  }, [connectedChainId]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        if (connected && chain) {
          latestChainIdRef.current = chain.id;
        }

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                type="button"
                className="px-4 py-2 bg-white text-black font-semibold rounded-xl border shadow-sm hover:shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1"
              >
                Connect Wallet <ChevronDown className="w-4 h-4" />
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                type="button"
                className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-xl border border-red-300 shadow-sm hover:shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                Wrong network
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    openChainModal();
                  }}
                  className="flex items-center px-4 py-2 bg-white text-black font-semibold rounded-xl border shadow-sm hover:shadow-md transition-transform hover:scale-105 active:scale-95"
                  type="button"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden mr-2"
                      style={{ background: chain.iconBackground }}
                    >
                      <img
                        src={chain.iconUrl}
                        alt={chain.name ?? 'Chain icon'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {chain.name}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={openAccountModal}
                  type="button"
                  className="px-4 py-2 bg-white text-black font-semibold rounded-xl border shadow-sm hover:shadow-md transition-transform hover:scale-105 flex items-center gap-1 active:scale-95"
                >
                  {account.displayName}

                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
