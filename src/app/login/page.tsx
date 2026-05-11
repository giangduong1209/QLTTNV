"use client";

import { useState } from "react";
import { LogIn, Loader2, User, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi đăng nhập");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-purple-600/10 blur-[80px] animate-bounce [animation-duration:10s]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 overflow-hidden group">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="text-center mb-10">
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
              <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transform transition-transform group-hover:scale-110 duration-500">
                <ShieldCheck className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              HR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">System</span>
            </h1>
            <p className="text-slate-400 font-medium">Đăng nhập để quản lý nhân viên</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800/80"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1 flex justify-between items-center">
                Mật khẩu
                <a href="#" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">Quên mật khẩu?</a>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800/80"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    disabled={isLoading}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="ml-3 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0f172a] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  Đăng nhập ngay
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="mt-10 pt-8 border-t border-slate-700/50 text-center space-y-3">
            <p className="text-slate-500 text-sm">
              &copy; 2026 <span className="text-slate-400 font-medium">QLTTNV</span>. Bản quyền thuộc về Giang Dương.
            </p>
            <p className="text-slate-400 text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute bottom-8 left-8 hidden lg:block">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-slate-400 font-medium">Server Status: Online</span>
        </div>
      </div>
    </div>
  );
}
