'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — application status now lives on the applicant dashboard. */
export default function ApplicantStatusRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/applicant/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-emerald-900 to-green-800 flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
    </div>
  );
}
