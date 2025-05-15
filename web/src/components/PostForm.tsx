import { useState } from "react";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

export default function PostForm() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Kullanıcı yok");

            let username = user.email?.split("@")[0] || "anonim";
            let photoURL = "https://i.ibb.co/wh9SNVZY/user.png";

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                username = userData.username || username;
                photoURL = userData.photoURL || photoURL;
            }

            await addDoc(collection(db, "posts"), {
                content,
                createdAt: serverTimestamp(),
                like: {
                    count: 0,
                    users: [],
                },
                uid: user.uid,
                email: user.email,
                username,
                photoURL,
            });

            setContent("");
        } catch (error) {
            console.error("Post gönderme hatası:", error);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <div className="flex gap-4">
                <img
                    src={auth.currentUser?.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                    alt="profile"
                    className="w-9 h-9 rounded-full"
                />
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Ne düşünüyorsun?"
                        rows={2}
                        className="w-full text-sm border border-gray-300 p-2 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#0A1231] text-white text-sm font-bold py-1.5 px-5 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
                        >
                            {loading ? "Gönderiliyor..." : "Paylaş"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
