import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    limit
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import PostItem from "@/components/PostItem";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

// Post tipini tanımla
type Post = {
    id: string;
    content?: string;
    createdAt?: {
        toDate: () => Date;
    };
    [key: string]: any; // diğer alanlar da olabilir
};

export default function SavedPosts() {
    const { user, loading: authLoading } = useAuth();
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            if (!user) return;

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();
                const savedPostIds: string[] = userData?.savedPosts || [];

                // Geçerli ID'leri filtrele (boş stringleri çıkar)
                const validPostIds = savedPostIds.filter(
                    (id) => typeof id === "string" && id.trim() !== ""
                );

                if (validPostIds.length === 0) {
                    setSavedPosts([]);
                    setIsLoading(false);
                    return;
                }

                const postsQuery = query(
                    collection(db, "posts"),
                    where("__name__", "in", validPostIds)
                );
                const postsSnapshot = await getDocs(postsQuery);

                const posts: Post[] = postsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as Post[];

                // createdAt tarihine göre sırala
                posts.sort((a, b) => {
                    const dateA = a.createdAt?.toDate() || new Date(0);
                    const dateB = b.createdAt?.toDate() || new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });

                setSavedPosts(posts);
            } catch (error) {
                console.error("Kaydedilen postlar yüklenirken hata:", error);
                setSavedPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSavedPosts();
    }, [user]);

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

    if (authLoading || isLoading) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="fixed left-0 top-0 h-screen w-[20%]">
                    <Sidebar />
                </div>
                <div className="flex-1 ml-[20%]">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sol Sidebar - Sabit */}
            <div className="fixed left-0 top-0 h-screen w-[20%]">
                <Sidebar />
            </div>

            {/* Ana İçerik - Kaydırılabilir */}
            <div className="flex-1 ml-[20%] mr-[25%]">
                <div className="max-w-2xl mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-6">Kaydedilen Postlar</h1>

                    {savedPosts.length > 0 ? (
                        <div className="space-y-4">
                            {savedPosts.map((post) => (
                                <PostItem key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                Henüz kaydedilmiş postunuz yok.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sağ Sidebar - Sabit */}
            <div className="fixed right-0 top-0 h-screen w-[25%] p-4 overflow-y-auto">
                <div className="sticky top-4 space-y-4 max-w-[90%] mx-auto">
                    {/* Mobil Uygulama Linki */}
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

                    {/* Önerilen Kullanıcılar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-200">
                        <h3 className="text-lg font-bold mb-4">Önerilen Kullanıcılar</h3>
                        <div className="space-y-4">
                            {suggestedUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.id}`}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                                >
                                    <img
                                        src={user.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-sm">{user.username}</p>
                                        <p className="text-xs text-gray-500">@{user.email?.split("@")[0]}</p>
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
