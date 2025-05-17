'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Home,
    MessageCircle,
    Users,
    User,
    Settings,
    Pencil,
    MoreHorizontal,
    LogOut,
    Bookmark,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import LoadingSpinner from "./LoadingSpinner";
import { useState } from "react";
import PostModal from "./PostModal";
import Cookies from "js-cookie";

export default function Sidebar() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [showPostModal, setShowPostModal] = useState(false);

    const handleLogout = async () => {
        try {
            // Remove auth token first
            Cookies.remove('auth-token');
            // Then sign out
            await signOut(auth);
            // Finally redirect
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#0A1231] text-white flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#0A1231] text-white flex flex-col justify-between px-4 py-6">
            {/* Üst Kısım: Logo ve Menü */}
            <div className="space-y-4">
                <h1 className="text-white text-2xl font-bold mb-4">AskQ</h1>

                <Link href="/">
                    <div className="flex items-center gap-4 px-3 py-3 hover:bg-gray-700/30 rounded-lg cursor-pointer transition">
                        <Home className="w-5 h-5" />
                        <span className="text-base">Home</span>
                    </div>
                </Link>

                <Link href="/messages">
                    <div className="flex items-center gap-4 px-3 py-3 hover:bg-gray-700/30 rounded-lg cursor-pointer transition">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-base">Messages</span>
                    </div>
                </Link>

                <Link href="/saved">
                    <div className="flex items-center gap-4 px-3 py-3 hover:bg-gray-700/30 rounded-lg cursor-pointer transition">
                        <Bookmark className="w-5 h-5" />
                        <span className="text-base">Kaydedilenler</span>
                    </div>
                </Link>

                <Link href={`/profile/${user?.uid}`}>
                    <div className="flex items-center gap-4 px-3 py-3 hover:bg-gray-700/30 rounded-lg cursor-pointer transition">
                        <User className="w-5 h-5" />
                        <span className="text-base">Profile</span>
                    </div>
                </Link>

                <Link href="/settings">
                    <div className="flex items-center gap-4 px-3 py-3 hover:bg-gray-700/30 rounded-lg cursor-pointer transition">
                        <Settings className="w-5 h-5" />
                        <span className="text-base">Settings</span>
                    </div>
                </Link>

                {/* Post Butonu */}
                <button
                    onClick={() => setShowPostModal(true)}
                    className="w-full bg-white text-[#0A1231] font-bold rounded-full py-2 mt-4 hover:bg-gray-100 transition"
                >
                    <Pencil size={16} className="inline mr-2" />
                    Post
                </button>
            </div>

            {/* Alt Kısım: Kullanıcı Bilgisi + Çıkış */}
            {user && (
                <div className="mt-6">
                    <div className="flex items-center justify-between px-2 py-2 hover:bg-gray-700/30 rounded-lg transition">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={user.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                    alt="profile"
                                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A1231]"></div>
                            </div>
                            <div>
                                <p className="font-bold text-sm">
                                    {user.displayName || user.email?.split("@")[0]}
                                </p>
                                <p className="text-sm text-gray-400">
                                    @{user.email?.split("@")[0]}
                                </p>
                            </div>
                        </div>
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full justify-center mt-4 text-sm text-red-400 hover:text-red-200 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>
            )}

            {showPostModal && (
                <PostModal onClose={() => setShowPostModal(false)} />
            )}
        </div>
    );
}
