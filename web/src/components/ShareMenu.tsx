import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Post, User } from "../types/post";
import { Search } from "lucide-react";

interface ShareMenuProps {
    userId: string;
    post: Post;
    recentContacts: User[];
    searchResults: User[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onClose: () => void;
}

export default function ShareMenu({
    userId,
    post,
    recentContacts,
    searchResults,
    searchQuery,
    setSearchQuery,
    onClose
}: ShareMenuProps) {
    const [loading, setLoading] = useState(false);

    const handleShare = async (receiverId: string) => {
        setLoading(true);
        try {
            await addDoc(collection(db, "messages"), {
                content: `Paylaşılan gönderi: ${post.content}`,
                senderId: userId,
                receiverId: receiverId,
                participants: [userId, receiverId],
                createdAt: serverTimestamp(),
                sharedPost: post,
                isRead: false
            });
            onClose();
        } catch (error) {
            console.error("Error sharing post:", error);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-96 max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Gönderiyi Paylaş</h3>
                </div>
                <div className="p-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Kullanıcı ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {(searchQuery ? searchResults : recentContacts).map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleShare(user.id)}
                                disabled={loading}
                                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                            >
                                <img
                                    src={user.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="text-left">
                                    <p className="font-medium text-sm">{user.username}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t">
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition"
                    >
                        İptal
                    </button>
                </div>
            </div>
        </div>
    );
}