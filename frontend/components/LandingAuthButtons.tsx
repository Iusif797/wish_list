"use client";

import Link from "next/link";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function LandingAuthButtons() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/login" className="btn-primary text-center min-w-[180px]">
          Войти
        </Link>
        <Link href="/register" className="btn-secondary text-center min-w-[180px]">
          Создать аккаунт
        </Link>
      </div>
      <GoogleAuthButton
        label="Войти через Google"
        className="min-w-[180px] btn-secondary flex items-center justify-center gap-2 mx-auto sm:mx-0"
      />
    </div>
  );
}
