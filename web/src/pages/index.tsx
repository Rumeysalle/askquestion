import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import PostItem from "@/components/PostItem";
import PostForm from "@/components/PostForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

export default function Home() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postArray);
    });

    // Fetch suggested users
    const usersQuery = query(collection(db, "users"), limit(5));
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSuggestedUsers(users);
    });

    return () => {
      unsubscribe();
      usersUnsubscribe();
    };
  }, [user]);

  if (!user) return (
    <div className="flex min-h-screen bg-white">
      <div className="fixed left-0 top-0 h-screen w-[20%]">
        <Sidebar />
      </div>
      <div className="flex-1 ml-[20%]">
        <LoadingSpinner />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar - 20% */}
      <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
        <Sidebar />
      </div>

      {/* Feed - 55% */}
      <div className="w-[55%] border-x border-gray-200 h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-200">
          <div className="max-w-[90%] mx-auto">
            <h2 className="text-xl font-bold p-4">Home</h2>
          </div>
        </div>

        <div className="max-w-[90%] mx-auto">
          <div className="border-b border-gray-200">
            <PostForm />
          </div>

          <div>
            {posts.length > 0 ? (
              posts.map((post) => <PostItem key={post.id} post={post} />)
            ) : (
              <p className="p-6 text-gray-600">Henüz gönderi yok.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - 25% */}
      <div className="w-[25%] p-4 h-screen overflow-y-auto hidden lg:block">
        <div className="sticky top-4 space-y-4 max-w-[90%] mx-auto">
          {/* Mobile App Link */}
          <div className="bg-[#0A1231] rounded-2xl p-4 text-white">
            <h3 className="text-xl font-bold mb-2">Mobil Uygulamamızı İndirin</h3>
            <p className="text-sm mb-4">Daha iyi bir deneyim için mobil uygulamamızı kullanın.</p>
            <Link href="#" className="block w-full bg-white text-[#0A1231] text-center py-2 rounded-full font-bold hover:bg-gray-100 transition">
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
                        <p className="font-bold text-sm">{user.username || user.email?.split("@")[0]}</p>
                        <p className="text-sm text-gray-500">@{user.email?.split("@")[0]}</p>
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
