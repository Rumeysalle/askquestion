
import { useEffect, useState } from "react";
import { db,auth } from "../../lib/firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
} from "firebase/firestore";

export default function CommentModal({ postId, onClose }: { postId: string; onClose: () => void }) {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<any[]>([]);
    const user = auth.currentUser;
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "posts", postId, "comments"),
            (snapshot) => {
                const commentData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setComments(commentData);
            }
        );
        return () => unsubscribe();
    }, [postId]);

    const handleSubmit = async () => {
        if (!comment.trim() || !user) return;
        await addDoc(collection(db, "posts", postId, "comments"), {
            text: comment,
            userId: user.uid,
            username: user.email?.split("@")[0],
            createdAt: serverTimestamp(),
        });
        setComment("");
    };

    const handleCopyURL = () => {
        const url = `${window.location.origin}/posts/${postId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSavePost = async () => {
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                savedPosts: arrayUnion(postId),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Post kaydedilemedi:", error);
        }
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
                <h2 className="text-xl font-bold mb-4">Yorumlar</h2>

                <div className="flex gap-4 mb-4">
                    <button
                        onClick={handleCopyURL}
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                    >
                        {copied ? "Link kopyalandı!" : "Post URL'sini kopyala"}
                    </button>

                    <button
                        onClick={handleSavePost}
                        className="text-sm text-green-700 underline hover:text-green-900"
                    >
                        {saved ? "Kaydedildi!" : "Postu kaydet"}
                    </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                    {comments.map((c) => (
                        <div key={c.id} className="text-sm text-gray-700">
                            <strong>{c.username}:</strong> {c.text}
                        </div>
                    ))}
                </div>

                <textarea
                    className="w-full border rounded px-3 py-2"
                    placeholder="Yorumunuzu yazın..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <div className="text-right mt-2">
                    <button
                        onClick={handleSubmit}
                        className="bg-[#0A1231] text-white px-4 py-2 rounded hover:bg-[#1f2a4a]"
                    >
                        Gönder
                    </button>
                </div>
            </div>
        </div>
    );
}