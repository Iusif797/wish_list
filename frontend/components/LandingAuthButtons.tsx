"use client";

import Link from "next/link";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function LandingAuthButtons() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <Link href="/login" className="google-auth-btn">
        <span className="google-auth-btn__glow" />
        <span className="google-auth-btn__content">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
          </svg>
          <span>Войти</span>
        </span>
      </Link>
      <Link href="/register" className="google-auth-btn">
        <span className="google-auth-btn__glow" />
        <span className="google-auth-btn__content">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
          <span>Создать аккаунт</span>
        </span>
      </Link>
      <GoogleAuthButton label="Войти через Google" />
    </div>
  );
}
