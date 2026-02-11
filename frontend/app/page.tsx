import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/wishlist-bg.png)" }}
      />
      <div className="absolute inset-0 bg-white/40" />
      <div className="relative z-10 flex flex-col items-center">
      <h1 className="text-5xl font-bold text-slate-900 mb-4">Wishlist</h1>
      <p className="text-slate-600 text-center max-w-md mb-12">
        Create wishlists, share with friends, and let them reserve or contribute to your gifts.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="px-8 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition text-center"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-8 py-3 border-2 border-primary-500 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition text-center"
        >
          Create account
        </Link>
      </div>
      <p className="mt-12 text-sm text-slate-500">
        Have a link? Enter it in the address bar to view a shared wishlist.
      </p>
      </div>
    </div>
  );
}
