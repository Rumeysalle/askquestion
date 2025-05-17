import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    arrayUnion,
    query,
    orderBy,
    limit,
} from "firebase/firestore";
import { MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { Post, Comment } from "../types/post";

interface CommentModalProps {
    post: Post;
    onClose: () => void;
}

export default function CommentModal({ post, onClose }: CommentModalProps) {
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<Comment[]>([]);
    const user = auth.currentUser;
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, "posts", post.id, "comments"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Comment[];
            setComments(commentData);
        });
        return () => unsubscribe();
    }, [post.id]);

    const handleSubmit = async () => {
        if (!comment.trim() || !user) return;
        await addDoc(collection(db, "posts", post.id, "comments"), {
            text: comment,
            userId: user.uid,
            username: user.email?.split("@")[0],
            userPhoto: user.photoURL || "https://i.ibb.co/wh9SNVZY/user.png",
            createdAt: serverTimestamp(),
        });
        setComment("");
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleCopyURL = () => {
        const url = `${window.location.origin}/posts/${post.id}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSavePost = async () => {
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                savedPosts: arrayUnion(post.id),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Error saving post:", error);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat("en-US", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Comments</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Comments Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <img
                                src={comment.userPhoto}
                                alt={comment.username}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <Link href={`/profile/${comment.userId}`}>
                                        <p className="font-medium text-sm hover:underline">
                                            {comment.username}
                                        </p>
                                    </Link>
                                    <p className="text-gray-900 mt-1">{comment.text}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(comment.createdAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                            alt="profile"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Write a comment..."
                                className="flex-1 p-2 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={!comment.trim()}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${comment.trim()
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    } transition`}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}