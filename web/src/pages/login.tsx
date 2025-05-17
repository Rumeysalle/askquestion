import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { loading: authLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.");
      } else if (err.code === "auth/wrong-password") {
        setError("Şifre yanlış. Lütfen tekrar deneyin.");
      } else {
        setError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sol: Logo/Büyük Yazı */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <span className="text-7xl md:text-8xl font-extrabold tracking-tight select-none" style={{ letterSpacing: '-0.05em' }}>AskQ</span>
      </div>
      {/* Sağ: Form ve içerik */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md space-y-8 p-8 rounded-2xl bg-[#16181c] shadow-2xl">
          <h1 className="text-4xl font-extrabold mb-2 leading-tight">Yanıtını Bul!</h1>
          <h2 className="text-2xl font-bold mb-6 text-[#1da1f2]">Hemen katıl.</h2>

          {/* Google ile giriş (sadece görsel) */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-full shadow hover:bg-gray-100 transition mb-3 border border-gray-200"
            disabled
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Google ile devam et
          </button>

          {/* Veya */}
          <div className="flex items-center my-2">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="mx-3 text-gray-400 text-sm font-semibold">VEYA</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Kayıt ol butonu */}
          <Link href="/register" className="block w-full">
            <button
              type="button"
              className="w-full bg-[#1da1f2] hover:bg-[#1a8cd8] text-white font-bold py-2 rounded-full text-lg transition mb-2 shadow"
            >
              Hemen kayıt ol
            </button>
          </Link>

          {/* Giriş formu */}
          <form className="space-y-4 mt-4" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">E-posta</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-700 bg-[#23272f] text-white rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1da1f2] focus:border-[#1da1f2] sm:text-sm transition-colors"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">Şifre</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-700 bg-[#23272f] text-white rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1da1f2] focus:border-[#1da1f2] sm:text-sm transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-200 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm font-semibold">{error}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1da1f2] hover:bg-[#1a8cd8] text-white font-bold py-2 rounded-full text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Zaten hesabın var mı? */}
          <div className="text-center mt-6">
            <span className="text-gray-400">Zaten bir hesabın var mı?</span>
            <Link href="/login" className="block mt-2">
              <button
                type="button"
                className="w-full border border-gray-600 text-white font-bold py-2 rounded-full text-lg hover:bg-[#23272f] transition"
              >
                Giriş yap
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
