import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Home, MessageCircle, Users, Settings, PencilLine } from "lucide-react";

export default function Sidebar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Firestore'dan kullanıcı verilerini çek
                const docRef = doc(db, "users", firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    const menuItems = [
        { label: "Home", path: "/", icon: <Home size={20} /> },
        { label: "Messages", path: "/messages", icon: <MessageCircle size={20} /> },
        { label: "Groups", path: "/groups", icon: <Users size={20} /> },
        { label: "Profile", path: "/profile", icon: <PencilLine size={20} /> },
        { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
    ];

    return (
        <div className="h-screen w-60 bg-[#0A1231] text-white flex flex-col justify-between fixed top-0 left-0 p-6 shadow-lg">
            <div>
                {/* Üst Profil Bilgisi */}
                <div className="flex items-center gap-3 mb-8">
                    <img
                        src={userData?.photoURL || "https://i.pravatar.cc/300"}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-bold text-white">{userData?.username || "Kullanıcı"}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                </div>

                {/* Menü Butonları */}
                <div className="space-y-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.path)}
                            className="flex items-center gap-3 w-full hover:bg-[#1f2937] py-2 px-3 rounded transition"
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alt: Post ve Logout */}
            <div className="mt-10">
                <button
                    onClick={() => router.push("/post")}
                    className="bg-white text-[#0A1231] font-bold py-2 w-full rounded-full hover:bg-gray-200 transition mb-4"
                >
                    Post
                </button>
                <button
                    onClick={handleLogout}
                    className="text-red-400 text-sm hover:underline w-full text-left"
                >
                    Çıkış Yap
                </button>
            </div>
        </div>
    );

}
