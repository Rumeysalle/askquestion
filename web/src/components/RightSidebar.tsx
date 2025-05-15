import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../lib/firebase";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default function RightSidebar() {
    const [user] = useAuthState(auth);
    const [newUsers, setNewUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchNewUsers = async () => {
            try {
                const q = query(
                    collection(db, "users"),
                    orderBy("createdAt", "desc"),
                    limit(5)
                );
                const querySnapshot = await getDocs(q);
                const users = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setNewUsers(users);
            } catch (error) {
                console.error("Yeni kullanıcılar yüklenirken hata:", error);
            }
        };

        fetchNewUsers();
    }, []);

    return (
        <div className="h-screen bg-white border-l border-gray-200 p-4">
            <div className="sticky top-4 space-y-6">
                {/* Mobil Uygulama Linki */}
                <div className="bg-[#0A1231] rounded-xl p-4 text-white">
                    <h3 className="font-bold text-lg mb-2">Mobil Uygulamamız</h3>
                    <p className="text-sm mb-4">Uygulamamızı indirin ve her an her yerden bağlı kalın!</p>
                    <div className="space-y-2">
                        <a
                            href="#"
                            className="block w-full bg-white text-[#0A1231] text-center py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            App Store'dan İndir
                        </a>
                        <a
                            href="#"
                            className="block w-full bg-white text-[#0A1231] text-center py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Google Play'den İndir
                        </a>
                    </div>
                </div>

                {/* Yeni Katılan Kullanıcılar */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-lg mb-4">Yeni Katılanlar</h3>
                    <div className="space-y-4">
                        {newUsers.map((newUser) => (
                            <div key={newUser.id} className="flex items-center space-x-3">
                                <img
                                    src={newUser.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {newUser.username || "Kullanıcı"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        @{newUser.email?.split("@")[0]}
                                    </p>
                                </div>
                                <button className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                                    Takip Et
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 