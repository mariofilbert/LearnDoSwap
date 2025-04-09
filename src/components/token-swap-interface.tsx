'use client';

import { useState, useEffect } from 'react';
import { ArrowDownIcon, ChevronDownIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import TokenSelector from '@/components/token-selector';
import type { Token, Network } from '@/lib/types';
import { networks, tokens } from '@/lib/data';

import ERC20ABI from '@/abis/ERC20ABI.json';
import SwapIntentABI from '@/abis/SwapIntentABI.json';

// Wagmi config
import {
  useAccount,
  useBalance,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { CustomConnectButton } from './custom-connect-button';
import { parseUnits } from 'viem';
import SuccessTransactionDialog from './success-trx-dialog';
import { cn } from '@/lib/utils';
import { writeContract } from 'viem/actions';

export default function TokenSwapInterface() {
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[0]);
  const [fromToken, setFromToken] = useState<Token | null>(tokens[0]);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isFromTokenModalOpen, setIsFromTokenModalOpen] = useState(false);
  const [isToTokenModalOpen, setIsToTokenModalOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [isSwapping, setIsSwapping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processedTransactionHash, setProcessedTransactionHash] = useState<
    string | null
  >(null);

  // const [slippage, setSlippage] = useState('0.5');

  // approval state tracker
  const [approvalState, setApprovalState] = useState({
    tokenAddress: '',
    approvedAmount: '0',
    isApproved: false,
  });

  // wagmi config
  const {
    address: wallet,
    isConnected: walletConnected,
    chain: currentChain,
  } = useAccount();

  const { switchChain } = useSwitchChain();

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: wallet,
    token: fromToken?.address as `0x${string}`,
    chainId: selectedNetwork?.chainId,
  });

  useEffect(() => {
    if (wallet && fromToken) {
      refetchBalance();
    }
  }, [selectedNetwork, fromToken, wallet, refetchBalance]);

  // Reset approval state when token or amount changes
  useEffect(() => {
    if (fromToken?.address !== approvalState.tokenAddress) {
      setApprovalState({
        tokenAddress: fromToken?.address || '',
        approvedAmount: '0',
        isApproved: false,
      });
    }
  }, [fromToken, approvalState.tokenAddress]);

  useEffect(() => {
    if (selectedNetwork && fromToken) {
      // Try to find the same token on the new network
      const sameTokenOnNewNetwork = tokens.find(
        (t) =>
          t.symbol === fromToken.symbol && t.network === selectedNetwork.name
      );

      if (sameTokenOnNewNetwork) {
        // If the same token exists on the new network, use it
        setFromToken(sameTokenOnNewNetwork);
      } else {
        // Otherwise, use the native token of the new network
        const nativeToken = tokens.find(
          (t) => t.network === selectedNetwork.name
        );

        if (nativeToken) {
          setFromToken(nativeToken);
        }
      }
    }
  }, [selectedNetwork]);

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);

    if (parseFloat(value || '0') > parseFloat(approvalState.approvedAmount)) {
      setApprovalState((prev) => ({
        ...prev,
        isApproved: false,
      }));
    }

    // In a real app, this would call an API to get the exchange rate
    if (fromToken && toToken) {
      // Simulate exchange rate with a small slippage
      const rate = 1;
      setToAmount(Number.parseFloat(value || '0') * rate + '');
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (parseFloat(value || '0') > parseFloat(approvalState.approvedAmount)) {
      setApprovalState((prev) => ({
        ...prev,
        isApproved: false,
      }));
    }
    // In a real app, this would call an API to get the exchange rate
    if (fromToken && toToken) {
      // Simulate exchange rate with a small slippage
      const rate = 1;
      setFromAmount(Number.parseFloat(value || '0') * rate + '');
    }
  };

  const {
    writeContract: approveToken,
    data: approveData,
    isPending: isPendingApprove,
    error: approveError,
  } = useWriteContract();

  const {
    writeContract: openIntent,
    data: openIntentData,
    isPending: isPendingIntent,
    error: intentError,
  } = useWriteContract();

  const {
    isSuccess: isApproveConfirmed,
    // isLoading: isLoadingTransactionApprove,
    isError: isErrorApprove,
  } = useWaitForTransactionReceipt({
    hash: approveData,
  });

  const {
    isSuccess: isIntentSuccess,
    // isLoading: isLoadingTransactionIntent,
    isError: isErrorIntent,
  } = useWaitForTransactionReceipt({
    hash: openIntentData,
  });

  // For approval transactions
  useEffect(() => {
    // When approve transaction completes
    if (isApproveConfirmed && approveData) {
      setIsApproving(false);
      if (fromToken) {
        setApprovalState({
          tokenAddress: fromToken.address || '',
          approvedAmount: fromAmount,
          isApproved: true,
        });
      }
    }

    // When approve transaction fails
    if (isErrorApprove) {
      setIsApproving(false);
    }
  }, [approveData, isApproveConfirmed, isErrorApprove]);

  // If the user cancels the approval
  useEffect(() => {
    if (isPendingApprove) {
      // Transaction is pending in the wallet
      setIsApproving(true);
    } else if (isApproving && !approveData) {
      // Transaction was pending but now it's not, and we don't have a hash
      // This means the user likely canceled the transaction
      setIsApproving(false);
    }
  }, [isPendingApprove, approveData]);

  // Reset approval state if approval transaction fails
  useEffect(() => {
    if (isErrorApprove) {
      setApprovalState({
        tokenAddress: fromToken?.address || '',
        approvedAmount: '0',
        isApproved: false,
      });
      setIsApproving(false);
    }
  }, [isErrorApprove]);

  // For swap transactions
  useEffect(() => {
    if (
      isIntentSuccess &&
      openIntentData &&
      openIntentData !== processedTransactionHash
    ) {
      setIsSwapping(false);
      setIsSuccessDialogOpen(true);
      setProcessedTransactionHash(openIntentData);

      // Reset approval state after successful swap
      setApprovalState({
        tokenAddress: fromToken?.address || '',
        approvedAmount: '0',
        isApproved: false,
      });
    }
  }, [isIntentSuccess, openIntentData]);

  // If the user cancels the swap
  useEffect(() => {
    if (isPendingIntent) {
      // Transaction is pending in the wallet
      setIsSwapping(true);
    } else if (isSwapping && !openIntentData) {
      // Transaction was pending but now it's not, and we don't have a hash
      // This means the user likely canceled the transaction
      setIsSwapping(false);
    }
  }, [isPendingIntent, openIntentData]);

  // Handle errors in if swap transaction fail
  useEffect(() => {
    if (isErrorIntent) {
      // You could show an error message here
      console.error('Swap transaction failed');
      setIsSwapping(false);
    }
  }, [isErrorIntent]);

  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////

  const {
    writeContract: mintToken,
    // data: mintedData,
    isPending: isPendingMint,
  } = useWriteContract();

  const handleMintToken = () => {
    if (!wallet || !currentChain) return;

    const amountToMintInWei = parseUnits('10', 18);
    const receiver = wallet;
    let tokenAddress = '';

    if (currentChain?.id === 11155111) {
      tokenAddress = '0x0daAe4993EFB4a5940eBb24E527584a939B3dBf9';
    } else if (currentChain?.id === 421614) {
      tokenAddress = '0x1C70d89E4E415C03BBDf59Ed8E2d081aDf06a837';
    } else if (currentChain?.id === 656476) {
      tokenAddress = '0x200a8D0E6c872FDE20B122B846DC17fB0E3f8f88';
    }
    mintToken({
      address: tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'mint',
      args: [wallet, amountToMintInWei],
    });
  };

  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////

  const approveSwap = (amount: string) => {
    if (!fromToken?.address || !currentChain) return false;

    const amountInWei = parseUnits(amount, 18); // Convert to correct decimals
    let swapContractAddress = '';
    if (currentChain?.id === 11155111) {
      swapContractAddress = '0x4274C980168b5714e80A1E8605c52d360A27e4eb';
    } else if (currentChain?.id === 656476) {
      swapContractAddress = '0xAD5D3957D35E19DD75bd5869e0EccC54741082f5';
    } else if (currentChain?.id === 421614) {
      swapContractAddress = '0x3799c092d1134B170b31c1F2D24D7C7111e42e06';
    } else {
      throw new Error('Unsupported chain');
    }
    approveToken({
      address: fromToken?.address as `0x${string}`,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [swapContractAddress, amountInWei],
    });

    console.log(`Approving ${amount} tokens`);
  };

  const handleSwap = () => {
    if (!wallet || !fromToken?.address || !toToken?.address || !currentChain)
      return;
    const sender = wallet;
    const inputToken = fromToken?.address;
    const amountIn = parseUnits(fromAmount, 18);
    const outputToken = toToken?.address;
    const amountOut = parseUnits(toAmount, 18);
    let swapContractAddress = '';

    if (currentChain?.id === 11155111) {
      swapContractAddress = '0x4274C980168b5714e80A1E8605c52d360A27e4eb';
    } else if (currentChain?.id === 656476) {
      swapContractAddress = '0xAD5D3957D35E19DD75bd5869e0EccC54741082f5';
    } else if (currentChain?.id === 421614) {
      swapContractAddress = '0x3799c092d1134B170b31c1F2D24D7C7111e42e06';
    } else {
      console.error('Unsupported chain');
      return;
    }

    openIntent({
      address: swapContractAddress as `0x${string}`,
      abi: SwapIntentABI,
      functionName: 'submitIntent',
      args: [
        sender, // sender
        inputToken,
        amountIn,
        outputToken,
        amountOut,
        toToken.chainId, // to chainId
        sender, // recipient
      ],
    });

    console.log('handleSwap');
  };

  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////

  const calculateUsdValue = (amount: string, token: Token | null) => {
    if (!token || !amount || isNaN(Number.parseFloat(amount))) return '$0.00';
    return `$${(Number.parseFloat(amount) * token.usdPrice).toFixed(2)}`;
  };

  const handleSwitchToken = (token: Token) => {
    // Don't allow switching during transactions
    if (isApproving || isSwapping) {
      return;
    }
    if (!fromToken || !token || fromToken === token) return;
    if (token.chainId !== selectedNetwork.chainId) {
      switchChain({ chainId: token.chainId });
    }

    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);

    setApprovalState({
      tokenAddress: toToken?.address || '',
      approvedAmount: '0',
      isApproved: false,
    });
  };

  const handleFromTokenSelect = (token: Token) => {
    if (token.chainId !== selectedNetwork.chainId) {
      try {
        switchChain({ chainId: token.chainId });
      } catch (error) {
        console.error('Failed to switch chain:', error);
      }
    }

    // Always update the token selection and reset approval state
    setFromToken(token);
    setApprovalState({
      tokenAddress: token.address || '',
      approvedAmount: '0',
      isApproved: false,
    });
  };

  const handleToTokenSelect = (token: Token) => {
    setToToken(token);
  };

  const handleNetworkChange = (network: Network) => {
    setSelectedNetwork(network);

    setApprovalState({
      tokenAddress: '',
      approvedAmount: '0',
      isApproved: false,
    });
  };

  const handleMaxAmount = () => {
    if (fromToken) {
      setFromAmount(balanceData?.formatted as string);
      // Reset approval state if max amount is greater than previously approved
      if (
        parseFloat(balanceData?.formatted as string) >
        parseFloat(approvalState.approvedAmount)
      ) {
        setApprovalState((prev) => ({
          ...prev,
          isApproved: false,
        }));
      }
      if (toToken) {
        // Simulate exchange rate with a small slippage
        const rate = 1;
        setToAmount(
          Number.parseFloat(balanceData?.formatted as string) * rate + ''
        );
      }
    }
  };

  const needsApproval = () => {
    return (
      !approvalState.isApproved ||
      fromToken?.address !== approvalState.tokenAddress ||
      parseFloat(fromAmount) > parseFloat(approvalState.approvedAmount)
    );
  };

  const isSwapButtonDisabled = () => {
    return (
      !fromToken ||
      !toToken ||
      !fromAmount ||
      fromToken === toToken ||
      isPendingIntent ||
      isPendingApprove ||
      isApproving ||
      isSwapping ||
      isNaN(Number(fromAmount)) ||
      Number(fromAmount) <= 0
    );
  };

  // Get the correct text for the swap button
  const getSwapButtonText = () => {
    if (!walletConnected) return 'Connect Wallet';
    if (!fromToken || !toToken) return 'Select Tokens';
    if (isApproving) return 'Approving Token...';
    if (isSwapping) return 'Swapping Token...';
    if (needsApproval()) return 'Approve Token';
    return 'Swap Token';
  };

  // Handle the swap button click
  const handleSwapButtonClick = () => {
    if (!walletConnected) return;

    if (needsApproval()) {
      approveSwap(fromAmount);
    } else {
      handleSwap();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="flex justify-center mb-10">
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-md"
          onClick={handleMintToken}
          disabled={!wallet || !currentChain || isPendingMint}
        >
          Mint 10 Test Token
        </Button>
      </div>
      {/* Header with logo and wallet connection */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <div className="text-2xl font-bold truncate">LearnDoSwap</div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <CustomConnectButton
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={handleNetworkChange}
          />
        </div>
      </div>

      {/* Main swap card */}
      <Card className="bg-[#111827] border-gray-800">
        <CardContent className="p-0">
          <Tabs defaultValue="swap" className="w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <TabsList className="bg-gray-800/50">
                <TabsTrigger
                  value="swap"
                  className="data-[state=active]:bg-gray-700"
                >
                  Swap
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="swap" className="mt-0">
              <div className="p-4">
                <div className="flex justify-between mb-1">
                  <div className="text-sm text-gray-400">You pay</div>
                  {fromToken && walletConnected && (
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      Balance: {balanceData?.formatted}
                      <button
                        onClick={handleMaxAmount}
                        className="text-blue-400 font-medium ml-1 hover:text-blue-300"
                      >
                        MAX
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-gray-900 rounded-xl p-3 mb-2">
                  <div className="flex justify-between mb-2">
                    <button
                      onClick={() => setIsFromTokenModalOpen(true)}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 text-white"
                    >
                      {fromToken ? (
                        <>
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                            <img
                              src={fromToken.logoURI}
                              alt={fromToken.symbol}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{fromToken.symbol}</span>
                        </>
                      ) : (
                        <span>Select token</span>
                      )}
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="bg-transparent text-right outline-none w-1/2 text-xl text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    {fromToken && (
                      <div className="flex items-center gap-1">
                        <span>
                          on {fromToken.network || selectedNetwork.name}
                        </span>
                      </div>
                    )}
                    <div>{calculateUsdValue(fromAmount, fromToken)}</div>
                  </div>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                  <Button
                    onMouseEnter={() => {
                      setIsHovered(true);
                    }}
                    onMouseLeave={() => {
                      setIsHovered(false);
                    }}
                    onClick={() => {
                      handleSwitchToken(toToken as Token);
                    }}
                    variant="outline"
                    size="icon"
                    // className="rounded-full border-gray-700 h-10 w-10"
                    className={cn(
                      'rounded-full bg-white transition-transform duration-200 hover:scale-110 hover:bg-white active:scale-90 h-10 w-10',
                      isHovered ? 'rotate-180' : ''
                    )}
                    disabled={!fromToken || !toToken}
                  >
                    <ArrowDownIcon className="h-8 w-8" />
                  </Button>
                </div>

                <div className="mt-1 mb-1 text-sm text-gray-400">
                  You receive
                </div>
                <div className="bg-gray-900 rounded-xl p-3 mb-4">
                  {toToken ? (
                    <>
                      <div className="flex justify-between mb-2">
                        <button
                          onClick={() => setIsToTokenModalOpen(true)}
                          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg px-2 py-1 text-white"
                        >
                          <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center overflow-hidden">
                            <img
                              src={
                                toToken.logoURI ||
                                '/placeholder.svg?height=24&width=24'
                              }
                              alt={toToken.symbol}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span>{toToken.symbol}</span>
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={toAmount}
                          onChange={(e) => handleToAmountChange(e.target.value)}
                          className="bg-transparent text-right outline-none w-1/2 text-xl text-white"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <span>
                            on {toToken.network || selectedNetwork.name}
                          </span>
                        </div>
                        <div>{calculateUsdValue(toAmount, toToken)}</div>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsToTokenModalOpen(true)}
                      className="w-full py-2 text-center text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-2"
                    >
                      <span>Select a token</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {fromToken && toToken && (
                  <div className="bg-gray-900 rounded-xl p-3 mb-4 text-sm text-white">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Rate</span>
                      <span>
                        1 {fromToken.symbol} = 1{toToken.symbol}
                      </span>
                    </div>
                    {/* Transaction status can be shown here */}
                    {isErrorApprove && (
                      <div className="text-red-500 mt-2">
                        Approval failed. Please try again.
                      </div>
                    )}
                    {isErrorIntent && (
                      <div className="text-red-500 mt-2">
                        Swap failed. Please try again.
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleSwapButtonClick}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-xl"
                  disabled={isSwapButtonDisabled()}
                >
                  {getSwapButtonText()}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Token selectors */}
      <TokenSelector
        isOpen={isFromTokenModalOpen}
        setIsOpen={setIsFromTokenModalOpen}
        onSelect={handleFromTokenSelect}
        selectedToken={fromToken}
        excludeToken={toToken}
        title="Select token to pay"
      />

      <TokenSelector
        isOpen={isToTokenModalOpen}
        setIsOpen={setIsToTokenModalOpen}
        onSelect={handleToTokenSelect}
        selectedToken={toToken}
        excludeToken={fromToken}
        title="Select token to receive"
      />

      {/* Success dialog */}
      <SuccessTransactionDialog
        sourceToken={fromToken}
        destinationToken={toToken}
        sourceAmount={fromAmount}
        destinationAmount={toAmount}
        sourceChain={selectedNetwork}
        destinationChain={toToken}
        isSuccessDialogOpen={isSuccessDialogOpen}
        setIsSuccessDialogOpen={setIsSuccessDialogOpen}
      />
    </div>
  );
}
