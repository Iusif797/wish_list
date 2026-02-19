import { LandingAuthButtons } from "@/components/LandingAuthButtons";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: "url(/wishlist-bg.png)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-primary-50/30 to-emerald-100/60 dark:from-slate-950/85 dark:via-primary-950/40 dark:to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-400/15 rounded-full blur-[80px] animate-float" style={{ animationDelay: "-3s" }} />
      <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-primary-300/10 rounded-full blur-[60px] animate-float" style={{ animationDelay: "-1.5s" }} />
      <div className="relative z-10 flex flex-col items-center animate-fade-in text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary-500/30 rounded-3xl blur-2xl scale-150" />
          <img src="/logo.png" alt="Список желаний" className="relative w-20 h-20 rounded-2xl shadow-glow-xl ring-2 ring-white/20 dark:ring-white/10" />
        </div>
        <h1 className="hero-title text-5xl sm:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
          Список <span className="gradient-text">желаний</span>
        </h1>
        <p className="hero-desc text-slate-700 dark:text-slate-200 max-w-xl mb-12 text-lg sm:text-xl leading-relaxed font-medium">
          Создавайте списки желаний, делитесь с друзьями, пусть они бронируют подарки или скидываются.
        </p>
        <LandingAuthButtons />
        <p className="mt-12 sm:mt-16 text-sm text-slate-500 dark:text-slate-400">
          Есть ссылка? Введите её в адресную строку, чтобы открыть общий список.
        </p>
      </div>
    </div>
  );
}
