'use client';

import React from 'react';
import { AlertTriangle, Loader2, WifiOff, X } from 'lucide-react';
import { getFriendlyErrorMessage } from '@/lib/friendly-error';

export interface LoadErrorModalProps {
  open: boolean;
  title?: string;
  error?: string | null;
  message?: string;
  onClose: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  retrying?: boolean;
}

export default function LoadErrorModal({
  open,
  title = 'Unable to Load',
  error,
  message,
  onClose,
  onRetry,
  retryLabel = 'Try Again',
  secondaryLabel,
  onSecondary,
  retrying = false,
}: LoadErrorModalProps) {
  if (!open) return null;

  const displayMessage =
    message ||
    getFriendlyErrorMessage(error, 'Something went wrong while loading. Please try again.');

  const looksLikeConnectionIssue =
    /connect|network|internet|server right now/i.test(displayMessage);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="load-error-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-gray-900 shadow-2xl p-6 sm:p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          {looksLikeConnectionIssue ? (
            <WifiOff className="h-7 w-7 text-red-600 dark:text-red-400" />
          ) : (
            <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
          )}
        </div>

        <h3
          id="load-error-title"
          className="text-xl font-bold text-gray-900 dark:text-white mb-2"
        >
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
          {displayMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60 disabled:hover:scale-100"
            >
              {retrying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Loader2 className="h-4 w-4" />
              )}
              {retryLabel}
            </button>
          )}
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className="flex-1 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
          {!onRetry && !onSecondary && (
            <button
              type="button"
              onClick={onClose}
              className="w-full px-5 py-3 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Ok
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
          If this keeps happening, refresh the page or try again in a few minutes.
        </p>
      </div>
    </div>
  );
}
