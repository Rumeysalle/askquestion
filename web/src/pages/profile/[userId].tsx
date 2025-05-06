import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
export default function UserProfile() {
    const router = useRouter();
    const { userId } = router.query;

    const [userData, setUserData] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            const userRef = doc(db, "users", userId as string);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserData(userSnap.data());
            }
        };

        const fetchUserPosts = async () => {
            const q = query(collection(db, "posts"), where("uid", "==", userId));
            const querySnapshot = await getDocs(q);
            const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUserPosts(posts);
        };

        fetchUser();
        fetchUserPosts();
    }, [userId]);

    if (!userData) return <p className="p-10 text-center">Yükleniyor...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-6">
                <img
                    src={userData.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                    alt="avatar"
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h1 className="text-xl font-bold">{userData.username}</h1>
                    <p className="text-sm text-gray-600">{userData.email}</p>
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-4">Gönderiler</h2>
            <div className="space-y-4">
                {userPosts.map((post) => (
                    <div key={post.id} className="bg-white p-4 rounded shadow">
                        <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
