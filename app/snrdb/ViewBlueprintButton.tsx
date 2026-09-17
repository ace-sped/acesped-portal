'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, X } from 'lucide-react';

const BLUEPRINT_SRC = '/images/snrdb/snrdb.pdf';

export default function ViewBlueprintButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-(--snrdb-leaf) px-5 py-2.5 text-sm font-semibold tracking-wide text-(--snrdb-forest) transition hover:bg-white/60"
      >
        <FileText className="h-4 w-4" />
        View Blueprint
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/60"
            role="dialog"
            aria-modal="true"
            aria-label="Southeast Nigeria Regional Development Blueprint"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative flex h-[80vh] min-h-[80vh] w-[80vw] shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold tracking-wide text-(--snrdb-forest) sm:text-base">
                    Southeast Nigeria Regional Development Blueprint
                  </p>
                  <p className="text-xs text-stone-500">snrdb.pdf · 2026 – 2050</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={BLUEPRINT_SRC}
                    download="snrdb.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                    aria-label="Download blueprint PDF"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                    aria-label="Close blueprint"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-stone-200">
                <iframe
                  src={`${BLUEPRINT_SRC}#view=FitH`}
                  title="Southeast Nigeria Regional Development Blueprint PDF"
                  className="h-full min-h-full w-full border-0"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
