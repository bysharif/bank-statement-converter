'use client';

/**
 * Dialog shown when no parser is detected for uploaded bank statement
 * Offers user two options: Request Support (recommended) or Try Universal Parser (beta)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NoParserDetectedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankName?: string;
  onRequestSupport: () => void;
  onTryUniversalParser: () => void;
}

export function NoParserDetectedDialog({
  open,
  onOpenChange,
  bankName,
  onRequestSupport,
  onTryUniversalParser,
}: NoParserDetectedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <DialogTitle>Bank Not Yet Supported</DialogTitle>
              <DialogDescription className="mt-1">
                {bankName
                  ? `We don't have a parser for ${bankName} yet`
                  : "We couldn't detect this bank"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-900">
              Don't worry! We can add support for this bank within 24-48 hours.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {/* Option 1: Request Support (Recommended) */}
            <button
              onClick={onRequestSupport}
              className="w-full text-left p-4 rounded-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">Request Support</h4>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Our team will build a custom parser for your bank within 24-48 hours.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-primary font-medium">
                    <span>✓ Guaranteed accuracy</span>
                    <span>•</span>
                    <span>✓ Get 10 free conversions</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Option 2: Try Universal Parser (Beta) */}
            <button
              onClick={onTryUniversalParser}
              className="w-full text-left p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-accent transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">Try Universal Parser</h4>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      Beta
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI-powered parser that works with most banks. Results may vary.
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    ⚡ Instant results • May require manual review
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
