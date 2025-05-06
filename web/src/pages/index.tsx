import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../../lib/firebase";
import Sidebar from "@/components/Sidebar";
import PostForm from "@/components/PostForm";
import PostList from "@/components/PostList";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen bg-[#E3E8FF] p-10">
        <PostForm />
        <PostList />
      </main>
    </div>
  );
}
