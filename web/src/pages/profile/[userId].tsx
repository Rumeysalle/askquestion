import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../lib/firebase";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    updateDoc,
    onSnapshot
} from "firebase/firestore";
import PostItem from "@/components/PostItem";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { Search, Link as LinkIcon, MessageCircle, MoreHorizontal } from "lucide-react";

export default function Profile() {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const { userId } = router.query;
    const [profileData, setProfileData] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Profil verilerini getir
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const userRef = doc(db, "users", userId as string);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (!data.username || !data.name) {
                        const emailUsername = data.email?.split("@")[0] || "user";
                        await updateDoc(userRef, {
                            username: emailUsername,
                            name: emailUsername
                        });
                        setProfileData({ ...data, username: emailUsername, name: emailUsername });
                    } else {
                        setProfileData(data);
                    }
                } else {
                    setProfileData(null);
                    setError("Profil bulunamadı");
                }
            } catch (error) {
                console.error("Profil yüklenirken hata:", error);
                setError("Profil yüklenirken bir hata oluştu");
                setProfileData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    // Gönderileri gerçek zamanlı takip et
    useEffect(() => {
        if (!userId) return;

        try {
            const postsQuery = query(
                collection(db, "posts"),
                where("uid", "==", userId)
            );

            const unsubscribe = onSnapshot(postsQuery,
                (querySnapshot) => {
                    const posts = querySnapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setUserPosts(posts);
                },
                (error) => {
                    console.error("Gönderiler yüklenirken hata:", error);
                }
            );

            return () => unsubscribe();
        } catch (error) {
            console.error("Gönderiler yüklenirken hata:", error);
        }
    }, [userId]);

    // Önerilen kullanıcıları getir
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const usersQuery = query(collection(db, "users"), limit(5));
                const usersSnapshot = await getDocs(usersQuery);
                const users = usersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setSuggestedUsers(users);
            } catch (error) {
                console.error("Önerilen kullanıcılar yüklenirken hata:", error);
            }
        };

        fetchSuggestedUsers();
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="flex-1 px-4 py-10">
                    <div className="bg-white rounded-xl p-6">
                        <p className="text-center text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="flex-1 px-4 py-10">
                    <div className="bg-white rounded-xl p-6">
                        <p className="text-center text-gray-600">Profil bulunamadı.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar - 20% */}
            <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                <Sidebar />
            </div>

            {/* Profile Content - 55% */}
            <div className="w-[55%] border-x border-gray-200 h-screen overflow-y-auto">
                {/* Cover Image */}
                <div className="h-48 bg-gray-200 relative">
                    {/* Profile Image */}
                    <div className="absolute -bottom-16 left-4">
                        <img
                            src={profileData.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                            alt="avatar"
                            className="w-32 h-32 rounded-full border-4 border-white"
                        />
                    </div>
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-300/20 rounded-full transition">
                            <Search className="w-5 h-5 text-gray-700" />
                        </button>
                        <button className="p-2 hover:bg-gray-300/20 rounded-full transition">
                            <LinkIcon className="w-5 h-5 text-gray-700" />
                        </button>
                        <Link href={`/messages?user=${userId}`}>
                            <button className="p-2 hover:bg-gray-300/20 rounded-full transition">
                                <MessageCircle className="w-5 h-5 text-gray-700" />
                            </button>
                        </Link>
                        <button className="p-2 hover:bg-gray-300/20 rounded-full transition">
                            <MoreHorizontal className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="pt-20 px-4">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold">{profileData.name}</h1>
                        <p className="text-gray-500">@{profileData.username}</p>
                    </div>

                    {profileData.bio && (
                        <p className="text-gray-900 mb-3">{profileData.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-4">
                        {profileData.location && (
                            <div className="flex items-center gap-1">
                                <span>📍</span>
                                <span>{profileData.location}</span>
                            </div>
                        )}
                        {profileData.website && (
                            <a
                                href={profileData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                            >
                                <span>🔗</span>
                                <span>{profileData.website}</span>
                            </a>
                        )}
                        <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>Katılma Tarihi: {profileData.createdAt?.toDate().toLocaleDateString("tr-TR")}</span>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 mb-4"></div>
                </div>

                {/* Posts */}
                <div className="divide-y divide-gray-200">
                    {userPosts.length > 0 ? (
                        userPosts.map((post) => <PostItem key={post.id} post={post} />)
                    ) : (
                        <p className="p-6 text-gray-600">Henüz gönderi yok.</p>
                    )}
                </div>
            </div>

            {/* Right Panel - 25% */}
            <div className="w-[25%] p-4 h-screen overflow-y-auto hidden lg:block">
                <div className="sticky top-4 space-y-4 max-w-[90%] mx-auto">
                    {/* Mobile App Link */}
                    <div className="bg-[#0A1231] rounded-2xl p-4 text-white">
                        <h3 className="text-xl font-bold mb-2">Mobil Uygulamamızı İndirin</h3>
                        <p className="text-sm mb-4">Daha iyi bir deneyim için mobil uygulamamızı kullanın.</p>
                        <Link
                            href="#"
                            className="block w-full bg-white text-[#0A1231] text-center py-2 rounded-full font-bold hover:bg-gray-100 transition"
                        >
                            İndir
                        </Link>
                    </div>

                    {/* Suggested Users */}
                    <div className="bg-gray-50 rounded-2xl">
                        <h3 className="text-xl font-bold p-4 border-b border-gray-200">Önerilen Kullanıcılar</h3>
                        <div className="divide-y divide-gray-200">
                            {suggestedUsers.map((user) => (
                                <Link href={`/profile/${user.id}`} key={user.id}>
                                    <div className="p-4 hover:bg-gray-100 transition">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                                alt="profile"
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <p className="font-bold text-sm">{user.name || user.email?.split("@")[0]}</p>
                                                <p className="text-sm text-gray-500">@{user.username || user.email?.split("@")[0]}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
