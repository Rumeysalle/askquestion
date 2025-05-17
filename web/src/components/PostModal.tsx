import { useState } from "react";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { Post } from "../types/post";

export default function PostModal({ onClose }: { onClose: () => void }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user found");

            let username = user.email?.split("@")[0] || "anonymous";
            let photoURL = "https://i.ibb.co/wh9SNVZY/user.png";

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                username = userData.username || username;
                photoURL = userData.photoURL || photoURL;
            }

            const postData = {
                content,
                createdAt: serverTimestamp(),
                senderId: user.uid,
                senderName: username,
                senderPhoto: photoURL,
                like: {
                    count: 0,
                    users: [],
                },
                comments: [],
            };

            console.log("Creating post with data:", postData);
            const docRef = await addDoc(collection(db, "posts"), postData);
            console.log("Post created with ID:", docRef.id);

            setContent("");
            onClose();
        } catch (error) {
            console.error("Error creating post:", error);
        }

        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    ✖
                </button>
                <h2 className="text-xl font-bold mb-4">New Post</h2>
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                        <div className="relative">
                            <img
                                src={auth.currentUser?.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                alt="profile"
                                className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="flex-1 border-none focus:ring-0 resize-none"
                            rows={4}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={!content.trim() || loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Posting..." : "Post"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 