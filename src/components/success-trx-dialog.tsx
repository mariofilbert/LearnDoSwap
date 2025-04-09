import {
  DialogContent,
  DialogTitle,
  DialogDescription,
  Dialog,
} from '@/components/ui/dialog';

import { Button } from './ui/button';
import { DialogHeader } from './ui/dialog';
import { Network, Token } from '@/lib/types';

interface SuccessTransactionDialogProps {
  isSuccessDialogOpen: boolean;
  setIsSuccessDialogOpen: (isSuccessDialogOpen: boolean) => void;
  sourceToken: Token | null;
  destinationToken: Token | null;
  sourceAmount: string;
  destinationAmount: string;
  sourceChain: Network;
  destinationChain: Token | null;
}

export default function SuccessTransactionDialog({
  sourceAmount,
  sourceToken,
  sourceChain,
  destinationAmount,
  destinationToken,
  destinationChain,
  isSuccessDialogOpen,
  setIsSuccessDialogOpen,
}: SuccessTransactionDialogProps) {
  return (
    <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span>Intent Submitted!</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Your cross-chain swap is being processed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-slate-700 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">From</span>
              <span className="font-medium">
                {sourceAmount} {sourceToken?.symbol} ({sourceChain.name})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">To</span>
              <span className="font-medium">
                {destinationAmount} {destinationToken?.symbol} (
                {destinationChain?.network})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status</span>
              <span className="text-green-400 font-medium">Processed</span>
            </div>
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              className="flex-1 bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500"
              onClick={() => setIsSuccessDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
