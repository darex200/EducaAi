"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type GoogleSignInButtonProps = {
  label: string;
  callbackUrl?: string;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.6 3.5-5.1 3.5-3.1 0-5.6-2.5-5.6-5.6S8.9 5.1 12 5.1c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 2.9 14.6 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.6 12 20.6c6.1 0 7.6-4.3 7.6-6.5 0-.4 0-.7-.1-1.1H12z"
      />
      <path
        fill="#34A853"
        d="M4.4 14.5 2 16.7A9.9 9.9 0 0 0 12 22c2.4 0 4.6-.8 6.2-2.2l-3-2.3c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.3-4z"
      />
      <path
        fill="#4A90E2"
        d="M2 7.3l3.6 2.8C6.4 7.8 8.9 6 12 6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 2.9 14.6 2 12 2 7.5 2 3.7 4.8 2 7.3z"
      />
      <path
        fill="#FBBC05"
        d="M12 20.6c2.3 0 4.2-.8 5.6-2.1l-2.7-2.1c-.7.5-1.7.8-2.9.8-2.5 0-4.6-1.7-5.3-4l-3.6 2.8c1.5 3 4.6 4.6 8.9 4.6z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  label,
  callbackUrl = "/tutor",
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <GoogleIcon />
      {isLoading ? "..." : label}
    </button>
  );
}
