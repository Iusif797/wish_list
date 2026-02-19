import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/wishlist-bg.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/90" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] sm:w-[600px] h-[90vw] sm:h-[600px] bg-primary-400/10 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <img src="/logo.png" alt="Список желаний" className="w-16 h-16 rounded-2xl shadow-glow-lg mb-6" />
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Список <span className="gradient-text">желаний</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-center max-w-lg mb-10 text-lg leading-relaxed">
          Создавайте списки желаний, делитесь с друзьями, пусть они бронируют подарки или скидываются.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="px-8 py-3.5 bg-gradient-to-r from-primary-500 to-emerald-500 text-white font-semibold rounded-2xl hover:from-primary-600 hover:to-emerald-600 transition-all shadow-glow hover:shadow-glow-lg text-center"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="px-8 py-3.5 glass-card text-slate-700 dark:text-slate-200 font-semibold rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all text-center"
          >
            Создать аккаунт
          </Link>
        </div>
        <p className="mt-8 sm:mt-14 text-sm text-slate-500 dark:text-slate-400">
          Есть ссылка? Введите её в адресную строку, чтобы открыть общий список.
        </p>
      </div>
    </div>
  );
}
