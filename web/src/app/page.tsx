'use client';

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    limit,
    getDocs,
    where,
    doc,
    getDoc,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import PostItem from "../components/PostItem";
import Sidebar from "../components/Sidebar";
import { Image, Video, Smile, Download, Share2 } from "lucide-react";
import PostModal from "../components/PostModal";
import LoadingSpinner from "../components/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [posts, setPosts] = useState<any[]>([]);
    const [showPostModal, setShowPostModal] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [recentChats, setRecentChats] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Fetch blocked users
    useEffect(() => {
        if (!user) return;

        const fetchBlockedUsers = async () => {
            try {
                const blockedUsersRef = collection(db, `users/${user.uid}/blocked_users`);
                const snapshot = await getDocs(blockedUsersRef);
                const blocked = snapshot.docs.map(doc => doc.id);
                setBlockedUsers(blocked);
            } catch (error) {
                console.error("Error loading blocked users:", error);
            }
        };

        fetchBlockedUsers();
    }, [user]);

    // Fetch recent chats
    useEffect(() => {
        if (!user) return;

        const fetchRecentChats = async () => {
            try {
                const messagesQuery = query(
                    collection(db, "messages"),
                    where("participants", "array-contains", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(messagesQuery);

                // Get unique users from recent messages
                const uniqueUsers = new Map();
                snapshot.docs.forEach(doc => {
                    const message = doc.data();
                    const otherUserId = message.participants.find((id: string) => id !== user.uid);
                    if (!uniqueUsers.has(otherUserId)) {
                        uniqueUsers.set(otherUserId, {
                            id: otherUserId,
                            lastMessage: message.content,
                            lastMessageTime: message.createdAt
                        });
                    }
                });

                // Get user details for each chat
                const usersWithDetails = await Promise.all(
                    Array.from(uniqueUsers.values()).map(async (chatUser) => {
                        const userDoc = await getDoc(doc(db, "users", chatUser.id));
                        return {
                            ...chatUser,
                            ...userDoc.data()
                        };
                    })
                );

                setRecentChats(usersWithDetails);
            } catch (error) {
                console.error("Son mesajlar yüklenirken hata:", error);
            }
        };

        fetchRecentChats();
    }, [user]);

    // Handle post share
    const handleSharePost = async (userId: string) => {
        if (!user || !selectedPost) return;

        try {
            await addDoc(collection(db, "messages"), {
                content: `Paylaşılan gönderi: ${selectedPost.content}`,
                senderId: user.uid,
                receiverId: userId,
                participants: [user.uid, userId],
                createdAt: serverTimestamp(),
                senderName: user.displayName || user.email?.split("@")[0] || "User",
                senderPhoto: user.photoURL,
                isRead: false,
                isArchived: false,
                sharedPost: selectedPost
            });

            setShowShareModal(false);
            setSelectedPost(null);
        } catch (error) {
            console.error("Gönderi paylaşılırken hata:", error);
        }
    };

    // Handle user search
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const searchResults = recentChats.filter(user =>
            user.name?.toLowerCase().includes(query.toLowerCase()) ||
            user.username?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(searchResults);
    };

    // Fetch posts
    useEffect(() => {
        console.log("Starting to fetch posts...");
        const q = query(
            collection(db, "posts"),
            orderBy("createdAt", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log("Received posts snapshot:", snapshot.docs.length, "posts");
            const postData = snapshot.docs.map((doc) => {
                const data = doc.data();
                console.log("Post data:", { id: doc.id, ...data });
                // Ensure post has required fields
                const post = {
                    id: doc.id,
                    content: data.content || "",
                    createdAt: data.createdAt,
                    senderId: data.senderId || data.uid, // fallback to uid if senderId doesn't exist
                    senderName: data.senderName || data.username, // fallback to username if senderName doesn't exist
                    senderPhoto: data.senderPhoto || data.photoURL, // fallback to photoURL if senderPhoto doesn't exist
                    like: data.like || { count: 0, users: [] },
                    comments: data.comments || []
                };
                console.log("Processed post:", post);
                return post;
            });
            console.log("Filtered posts:", postData.length);
            setPosts(postData);
        }, (error) => {
            console.error("Error fetching posts:", error);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const usersQuery = query(
                    collection(db, "users"),
                    limit(5)
                );
                const snapshot = await getDocs(usersQuery);
                const users = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(user => !blockedUsers.includes(user.id));
                setSuggestedUsers(users);
            } catch (error) {
                console.error("Önerilen kullanıcılar yüklenirken hata:", error);
            }
        };

        fetchSuggestedUsers();
    }, [blockedUsers]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* Sidebar %20 */}
            <aside className="h-screen flex-shrink-0 flex flex-col items-center justify-between bg-[#0A1231]" style={{ width: '20%' }}>
                <Sidebar />
            </aside>

            {/* Feed %55 */}
            <main className="h-screen flex-shrink-0 flex-grow flex flex-col items-center justify-start overflow-y-auto bg-gray-100" style={{ width: '55%' }}>
                <div className="w-full p-8">
                    {/* Post Creation */}
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                src={user?.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                alt="profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <button
                                onClick={() => setShowPostModal(true)}
                                className="flex-1 text-left text-gray-500 hover:bg-gray-100 p-2 rounded-full transition"
                            >
                                What's on your mind?
                            </button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition">
                                <Image className="w-5 h-5" />
                                <span>Fotoğraf</span>
                            </button>
                            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition">
                                <Video className="w-5 h-5" />
                                <span>Video</span>
                            </button>
                            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition">
                                <Smile className="w-5 h-5" />
                                <span>Duygu</span>
                            </button>
                        </div>
                    </div>

                    {/* Posts Feed */}
                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No posts yet. Be the first to post!</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostItem
                                    key={post.id}
                                    post={post}
                                    onShare={() => {
                                        setSelectedPost(post);
                                        setShowShareModal(true);
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>

            <aside
                className="h-screen flex-shrink-0 bg-white p-4"
                style={{ width: "25%" }}
            >
                <div className="h-full flex flex-col gap-4">

                    {/* 📱 Mobil Uygulama Kutusu */}
                    <div
                        className="bg-[#0A1231] rounded-2xl text-white w-full flex flex-col justify-between items-center p-8"
                        style={{ minHeight: "300px" }}
                    >
                        {/* Büyük Başlık */}
                        <h2 className="text-2xl font-extrabold text-center mb-4">
                            Mobil Uygulamamızı İndirin
                        </h2>

                        {/* Daha büyük açıklama yazısı */}
                        <p className="text-base text-center leading-relaxed mb-6 px-2">
                            Daha iyi bir deneyim için <br /> mobil uygulamamızı kullanın.
                        </p>

                        {/* Büyük Buton */}
                        <button
                            className="bg-white text-[#0A1231] font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-200 transition flex items-center justify-center gap-2 w-full max-w-[260px]"
                        >
                            <Download className="w-6 h-6" />
                            İndir
                        </button>
                    </div>



                    {/* 👤 Önerilen Kullanıcılar Kutusu */}
                    <div
                        className="bg-white border border-gray-300 rounded-2xl px-4 py-6 w-full flex flex-col"
                        style={{ flex: "1 1 65%" }}
                    >
                        <h2 className="text-lg font-bold mb-4 text-black">Önerilen Kullanıcılar</h2>

                        <div className="space-y-4 overflow-y-auto flex-1">
                            {suggestedUsers.map((user) => (
                                <Link
                                    href={`/profile/${user.id}`}
                                    key={user.id}
                                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
                                >
                                    <img
                                        src={user.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-sm text-black">{user.username}</p>
                                        <p className="text-xs text-gray-500">@{user.email?.split("@")[0]}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {showPostModal && (
                <PostModal onClose={() => setShowPostModal(false)} />
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-96 max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">Gönderiyi Paylaş</h3>
                        </div>
                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Kullanıcı ara..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                            />
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                {(searchQuery ? searchResults : recentChats).map((chatUser) => (
                                    <button
                                        key={chatUser.id}
                                        onClick={() => handleSharePost(chatUser.id)}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition"
                                    >
                                        <img
                                            src={chatUser.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                            alt={chatUser.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="text-left">
                                            <p className="font-medium text-sm">{chatUser.username}</p>
                                            <p className="text-xs text-gray-500">{chatUser.lastMessage}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 border-t">
                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    setSelectedPost(null);
                                }}
                                className="w-full py-2 text-gray-500 hover:bg-gray-50 rounded-lg transition"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 