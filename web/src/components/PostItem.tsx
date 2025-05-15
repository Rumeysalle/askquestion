import { useState } from "react";
import { auth, db } from "../../lib/firebase";
import {
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    increment,
} from "firebase/firestore";
import CommentModal from "./CommentModal";
import {
    MessageCircle,
    Heart,
    Bookmark,
    BookmarkCheck,
    Share2,
} from "lucide-react";
import UserHoverCard from "./UserHoverCard";
import Link from "next/link";

export default function PostItem({ post }: { post: any }) {
    const user = auth.currentUser;
    const userId = user?.uid;
    const hasLiked = post.like?.users?.includes(userId);
    const [showModal, setShowModal] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleLike = async () => {
        if (!user) return;
        const postRef = doc(db, "posts", post.id);
        await updateDoc(postRef, {
            "like.users": hasLiked ? arrayRemove(userId) : arrayUnion(userId),
            "like.count": increment(hasLiked ? -1 : 1),
        });
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
            console.error("Post kaydedilemedi:", error);
        }
    };

    return (
        <div className="p-4 hover:bg-gray-50 transition-all duration-200 relative border-b border-gray-200">
            <Link href={`/profile/${post.uid}`}>
                <div
                    className="flex items-center gap-2 mb-2 cursor-pointer"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <img
                        src={post.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                        alt="profile"
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <p className="font-bold text-sm text-gray-900">
                            {post.username || "Kullanıcı"}
                        </p>
                        <p className="text-sm text-gray-500">
                            @{post.email?.split("@")[0]}
                        </p>
                    </div>
                </div>
            </Link>

            {hovered && (
                <div className="absolute top-16 left-4 z-50">
                    <UserHoverCard userId={post.uid} />
                </div>
            )}

            <p className="text-gray-900 text-[15px] mb-2 leading-6">{post.content}</p>

            <div className="flex items-center justify-between gap-4 text-sm text-gray-500 mt-3">
                {/* Sol: Paylaş */}
                <button className="hover:text-blue-500 transition flex items-center gap-1">
                    <Share2 size={16} />
                    <span>Paylaş</span>
                </button>

                {/* Ortada: Yorum */}
                <button
                    onClick={() => setShowModal(true)}
                    className="hover:text-green-600 transition flex items-center gap-1"
                >
                    <MessageCircle size={16} />
                    <span>Yorum</span>
                </button>

                {/* Beğeni */}
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 hover:text-red-600 transition`}
                >
                    <Heart
                        size={16}
                        className={`${hasLiked ? "text-red-600 fill-red-600" : "text-gray-500"
                            }`}
                    />
                    <span>{post.like?.count || 0}</span>
                </button>

                {/* Kaydet */}
                <button
                    onClick={handleSavePost}
                    className="hover:text-green-700 flex items-center gap-1 transition"
                >
                    {saved ? (
                        <BookmarkCheck size={16} className="text-blue-600 fill-blue-600" />
                    ) : (
                        <Bookmark size={16} />
                    )}
                    <span>Kaydet</span>
                </button>
            </div>

            {showModal && (
                <CommentModal postId={post.id} onClose={() => setShowModal(false)} />
            )}
        </div>
    );
}
