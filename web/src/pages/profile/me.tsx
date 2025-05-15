import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../lib/firebase";
import { serverTimestamp } from "firebase/firestore";
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    updateDoc,
    setDoc,
    orderBy
} from "firebase/firestore";
import PostItem from "@/components/PostItem";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MyProfile() {
    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    // Eğer username ve name yoksa, email'den oluştur
                    if (!data.username || !data.name) {
                        const emailUsername = data.email?.split("@")[0] || "user";
                        await updateDoc(userRef, {
                            username: emailUsername,
                            name: emailUsername
                        });
                        setUserData({ ...data, username: emailUsername, name: emailUsername });
                    } else {
                        setUserData(data);
                    }
                } else {
                    // Kullanıcı dokümanı yoksa oluştur
                    const emailUsername = user.email?.split("@")[0] || "user";
                    const newUserData = {
                        uid: user.uid,
                        email: user.email,
                        username: emailUsername,
                        name: emailUsername,
                        photoURL: user.photoURL,
                        createdAt: serverTimestamp()
                    };
                    await setDoc(userRef, newUserData);
                    setUserData(newUserData);
                }
            } catch (error) {
                console.error("Kullanıcı verileri yüklenirken hata:", error);
            }
        };

        // Gerçek zamanlı gönderi takibi
        const postsQuery = query(
            collection(db, "posts"),
            where("uid", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
            const posts = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUserPosts(posts);
            setIsLoading(false);
        });

        fetchUser();

        return () => unsubscribe();
    }, [user]);

    if (loading || isLoading) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="flex-1">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (!userData) {
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
            <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                <Sidebar />
            </div>

            <div className="flex-1 max-w-2xl mx-auto px-4 py-10">
                <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <img
                            src={userData.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                            alt="avatar"
                            className="w-24 h-24 rounded-full mb-4 border-2 border-gray-200"
                        />
                        <h1 className="text-2xl font-bold text-gray-900">{userData.name || userData.username || "Kullanıcı"}</h1>
                        <p className="text-sm text-gray-500">@{userData.username || userData.email?.split("@")[0]}</p>
                        {userData.bio && <p className="mt-2 text-gray-600">{userData.bio}</p>}
                        {userData.website && (
                            <a
                                href={userData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline mt-1"
                            >
                                {userData.website}
                            </a>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Katılma Tarihi:{" "}
                            {userData.createdAt
                                ? (userData.createdAt.toDate?.() || userData.createdAt).toLocaleDateString("tr-TR")
                                : "Bilinmiyor"}
                        </p>

                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Gönderiler</h2>
                    <div className="space-y-4">
                        {userPosts.length > 0 ? (
                            userPosts.map((post) => <PostItem key={post.id} post={post} />)
                        ) : (
                            <p className="text-gray-500">Henüz gönderiniz yok.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
