import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Auth } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Zaten böyle bir e-posta adresi var. Lütfen giriş yapın.");
      } else if (err.code === "auth/wrong-password") {
        setError("Şifre ve mail eşleşmiyor.");
      } else {
        setError("Bir hata oluştu.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#E3E8FF] flex items-center justify-center px-4">
      <div className="bg-[#0A1231] w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">Hemen giriş yap</h1>
        <p className="text-white text-center italic mb-6">Sorularına Yanıt bul!</p>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-white">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white">Şifre</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
              />
              <span
                className="absolute right-3 top-2.5 text-gray-300 cursor-pointer select-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁" : "🙈"}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-white text-[#0A1231] py-1.5 rounded-md font-bold hover:bg-gray-200 transition"
          >
            Giriş Yap
          </button>
        </form>


        <p className="text-center text-sm text-white mt-4 italic underline cursor-pointer">
          <span onClick={() => router.push("/register")}>
            Hesabın yok mu? Kayıt Ol
          </span>
        </p>
      </div>
    </div>
  );
}
