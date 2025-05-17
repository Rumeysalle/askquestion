import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { auth, db } from "../../lib/firebase";
import {
    limit,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    DocumentData,
    deleteDoc,
    writeBatch,
    setDoc
} from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
    Search,
    Send,
    Archive,
    Trash2,
    MoreVertical,
    Clock,
    ChevronRight,
    MessageSquare,
    Settings,
    UserX,
    Shield,
    Flag
} from "lucide-react";
import { useSwipeable } from "react-swipeable";

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: any;
    senderName: string;
    senderPhoto: string;
    participants: string[];
    isRead: boolean;
    isArchived?: boolean;
}

interface ChatUser {
    id: string;
    name: string;
    username: string;
    photoURL: string;
    lastMessage?: string;
    lastMessageTime?: any;
    unreadCount?: number;
    isArchived?: boolean;
    isBlocked?: boolean;
}

// Date grouping helper
const getMessageDateGroup = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
};

export default function Messages() {
    const router = useRouter();
    const { user: selectedUserId } = router.query;
    const [user] = useAuthState(auth);
    const [isLoading, setIsLoading] = useState(true);
    const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [showArchived, setShowArchived] = useState(false);
    const [showChatMenu, setShowChatMenu] = useState(false);
    const [activeChatMenu, setActiveChatMenu] = useState<string | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeChatMenu) {
                setActiveChatMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeChatMenu]);

    // Tüm kullanıcıları getir
    useEffect(() => {
        if (!user) return;

        const fetchUsers = async () => {
            try {
                // Engellenen kullanıcıları getir
                const blockedUsersSnapshot = await getDocs(collection(db, "users", user.uid, "blocked_users"));
                const blockedUserIds = blockedUsersSnapshot.docs.map(doc => doc.id);

                const usersQuery = query(collection(db, "users"));
                const usersSnapshot = await getDocs(usersQuery);
                const users = usersSnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        isBlocked: blockedUserIds.includes(doc.id)
                    }))
                    .filter(userData => userData.id !== user.uid) as ChatUser[];

                // Her kullanıcı için son mesajı getir
                const usersWithLastMessage = await Promise.all(
                    users.map(async (userData) => {
                        const participants = [user.uid, userData.id].sort();
                        const messagesQuery = query(
                            collection(db, "messages"),
                            where("participants", "array-contains", participants[0]),
                            orderBy("createdAt", "desc")
                        );
                        const messagesSnapshot = await getDocs(messagesQuery);
                        const messages = messagesSnapshot.docs
                            .map(doc => doc.data() as Message)
                            .filter(msg =>
                                msg.participants.includes(user.uid) &&
                                msg.participants.includes(userData.id)
                            );

                        const lastMessage = messages[0];

                        return {
                            ...userData,
                            lastMessage: lastMessage?.content,
                            lastMessageTime: lastMessage?.createdAt
                        };
                    })
                );

                // Son mesajlaşılan kişileri en üstte göster
                const sortedUsers = usersWithLastMessage.sort((a, b) => {
                    if (!a.lastMessageTime) return 1;
                    if (!b.lastMessageTime) return -1;
                    return b.lastMessageTime.toDate() - a.lastMessageTime.toDate();
                });

                setChatUsers(sortedUsers);
                setIsLoading(false);
            } catch (error) {
                console.error("Kullanıcılar yüklenirken hata:", error);
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    // Seçili kullanıcı ile olan mesajları getir
    useEffect(() => {
        if (!user || !selectedUser) return;

        // Engellenmiş kullanıcının mesajları gösterilmez
        if (selectedUser.isBlocked) {
            setMessages([]);
            return;
        }

        const messagesQuery = query(
            collection(db, "messages"),
            where("participants", "array-contains", user.uid),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
            const messages = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Message))
                .filter(msg =>
                    (msg.senderId === user.uid && msg.receiverId === selectedUser.id) ||
                    (msg.senderId === selectedUser.id && msg.receiverId === user.uid)
                )
                .filter(msg => !msg.isArchived); // Arşivlenmiş mesajları gösterme

            // Okunmamış mesajları okundu olarak işaretle
            const unreadMessages = messages.filter(
                msg => !msg.isRead && msg.senderId === selectedUser.id
            );

            for (const message of unreadMessages) {
                await updateDoc(doc(db, "messages", message.id), {
                    isRead: true
                });
            }

            setMessages(messages);
        });

        return () => unsubscribe();
    }, [user, selectedUser]);

    // URL'den gelen kullanıcı ID'sini işle
    useEffect(() => {
        if (selectedUserId && chatUsers.length > 0) {
            const userToSelect = chatUsers.find(u => u.id === selectedUserId);
            if (userToSelect) {
                setSelectedUser(userToSelect);
            }
        }
    }, [selectedUserId, chatUsers]);

    // Kullanıcı arama
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        const searchQuery = query.toLowerCase();
        const results = chatUsers.filter(user =>
            !user.isBlocked && (
                user.name.toLowerCase().includes(searchQuery) ||
                user.username.toLowerCase().includes(searchQuery)
            )
        );
        setSearchResults(results);
    };

    // Mesaj gönderme
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedUser || !newMessage.trim()) return;

        // Engellenmiş kullanıcıya mesaj gönderilemez
        if (selectedUser.isBlocked) {
            return;
        }

        try {
            const messageRef = await addDoc(collection(db, "messages"), {
                content: newMessage,
                senderId: user.uid,
                receiverId: selectedUser.id,
                participants: [user.uid, selectedUser.id],
                createdAt: serverTimestamp(),
                senderName: user.displayName || user.email?.split("@")[0] || "User",
                senderPhoto: user.photoURL,
                isRead: false,
                isArchived: false
            });

            // Mesajı hemen UI'da göster
            const newMessageObj: Message = {
                id: messageRef.id,
                content: newMessage,
                senderId: user.uid,
                receiverId: selectedUser.id,
                participants: [user.uid, selectedUser.id],
                createdAt: new Date(),
                senderName: user.displayName || user.email?.split("@")[0] || "User",
                senderPhoto: user.photoURL || "",
                isRead: false,
                isArchived: false
            };
            setMessages(prev => [...prev, newMessageObj]);
            setNewMessage("");
        } catch (error) {
            console.error("Mesaj gönderilirken hata:", error);
        }
    };

    // Mesaj arşivleme
    const handleArchiveMessage = async (messageId: string) => {
        try {
            await updateDoc(doc(db, "messages", messageId), {
                isArchived: true
            });
        } catch (error) {
            console.error("Mesaj arşivlenirken hata:", error);
        }
    };

    // Mesaj silme
    const handleDeleteMessage = async (messageId: string) => {
        try {
            await deleteDoc(doc(db, "messages", messageId));
        } catch (error) {
            console.error("Mesaj silinirken hata:", error);
        }
    };

    // Archive chat
    const handleArchiveChat = async () => {
        if (!user || !selectedUser) return;
        try {
            const messagesQuery = query(
                collection(db, "messages"),
                where("participants", "array-contains", user.uid)
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            const batch = writeBatch(db);
            messagesSnapshot.docs.forEach(doc => {
                if (doc.data().participants.includes(selectedUser.id)) {
                    batch.update(doc.ref, { isArchived: true });
                }
            });
            await batch.commit();
            setSelectedUser(null);
            setShowChatMenu(false);
        } catch (error) {
            console.error("Sohbet arşivlenirken hata:", error);
        }
    };

    // Delete chat
    const handleDeleteChat = async () => {
        if (!user || !selectedUser) return;
        try {
            const messagesQuery = query(
                collection(db, "messages"),
                where("participants", "array-contains", user.uid)
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            const batch = writeBatch(db);
            messagesSnapshot.docs.forEach(doc => {
                if (doc.data().participants.includes(selectedUser.id)) {
                    batch.delete(doc.ref);
                }
            });
            await batch.commit();
            setSelectedUser(null);
            setShowChatMenu(false);
        } catch (error) {
            console.error("Sohbet silinirken hata:", error);
        }
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
        const date = message.createdAt?.toDate?.() || message.createdAt;
        const group = getMessageDateGroup(date);
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(message);
        return groups;
    }, {});

    // Message component with time tooltip
    const MessageItem = ({ message, onArchive, onDelete, isOwnMessage }: {
        message: Message;
        onArchive: (id: string) => void;
        onDelete: (id: string) => void;
        isOwnMessage: boolean;
    }) => {
        const [swipeOffset, setSwipeOffset] = useState(0);
        const [showActions, setShowActions] = useState(false);
        const [showTime, setShowTime] = useState(false);

        const formatTime = (timestamp: any) => {
            if (!timestamp) return '';
            if (timestamp.toDate) {
                return timestamp.toDate().toLocaleTimeString();
            }
            if (timestamp instanceof Date) {
                return timestamp.toLocaleTimeString();
            }
            if (typeof timestamp === 'number') {
                return new Date(timestamp).toLocaleTimeString();
            }
            return '';
        };

        const handlers = useSwipeable({
            onSwiping: (e) => {
                if (isOwnMessage && e.dir === "Left") {
                    setSwipeOffset(Math.min(e.deltaX, 100));
                    setShowTime(true);
                }
            },
            onSwipedLeft: (e) => {
                if (isOwnMessage) {
                    if (e.deltaX > 50) {
                        setShowActions(true);
                        setSwipeOffset(100);
                    } else {
                        setSwipeOffset(0);
                        setShowTime(false);
                    }
                }
            },
            onSwipedRight: () => {
                setSwipeOffset(0);
                setShowActions(false);
                setShowTime(false);
            },
            trackMouse: true
        });

        return (
            <div className="relative" {...handlers}>
                <div
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    style={{ transform: `translateX(${swipeOffset}px)` }}
                >
                    <div className={`max-w-[70%] rounded-lg p-3 ${isOwnMessage ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                        }`}>
                        <p>{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                            {showTime && (
                                <p className="text-xs opacity-70">
                                    {formatTime(message.createdAt)}
                                </p>
                            )}
                            {isOwnMessage && (
                                <span className="text-xs">
                                    {message.isRead ? "✓✓" : "✓"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {showActions && isOwnMessage && (
                    <div className="absolute right-0 top-0 flex gap-2">
                        <button
                            onClick={() => onArchive(message.id)}
                            className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                            title="Arşivle"
                        >
                            <Archive className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(message.id)}
                            className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                            title="Sil"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Handle chat menu click
    const handleChatMenuClick = (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveChatMenu(activeChatMenu === userId ? null : userId);
    };

    // Handle chat archive
    const handleChatArchive = async (userId: string) => {
        if (!user) return;
        try {
            const batch = writeBatch(db);

            // Get all messages between users
            const messagesQuery = query(
                collection(db, "messages"),
                where("participants", "array-contains", [user.uid, userId].sort().join("_"))
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            // Update all messages to archived
            messagesSnapshot.docs.forEach((doc) => {
                const messageRef = doc.ref;
                batch.update(messageRef, { isArchived: true });
            });

            // Update chat user list
            const chatUserRef = doc(db, `users/${user.uid}/chat_users/${userId}`);
            batch.update(chatUserRef, { isArchived: true });

            await batch.commit();

            // Update local state immediately
            setChatUsers(prev => prev.map(chatUser =>
                chatUser.id === userId
                    ? { ...chatUser, isArchived: true }
                    : chatUser
            ));

            // Close menu after successful archive
            setActiveChatMenu(null);
        } catch (error) {
            console.error("Sohbet arşivlenirken hata:", error);
        }
    };

    // Handle chat delete
    const handleChatDelete = async (userId: string) => {
        if (!user) return;
        try {
            const batch = writeBatch(db);

            // Get all messages between users
            const messagesQuery = query(
                collection(db, "messages"),
                where("participants", "array-contains", [user.uid, userId].sort().join("_"))
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            // Delete all messages
            messagesSnapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // Delete chat user reference
            const chatUserRef = doc(db, `users/${user.uid}/chat_users/${userId}`);
            batch.delete(chatUserRef);

            await batch.commit();

            // Update local state immediately
            setChatUsers(prev => prev.filter(chatUser => chatUser.id !== userId));

            // If the deleted chat is currently selected, clear the selection
            if (selectedUser?.id === userId) {
                setSelectedUser(null);
                setMessages([]);
            }

            // Close menu after successful delete
            setActiveChatMenu(null);
        } catch (error) {
            console.error("Sohbet silinirken hata:", error);
        }
    };

    // Handle block user
    const handleBlockUser = async (userId: string) => {
        if (!user) return;
        try {
            const batch = writeBatch(db);

            // Add to blocked users
            const blockedUserRef = doc(db, `users/${user.uid}/blocked_users/${userId}`);
            batch.set(blockedUserRef, { blockedAt: serverTimestamp() });

            // Archive all messages
            const messagesQuery = query(
                collection(db, "messages"),
                where("participants", "array-contains", [user.uid, userId].sort().join("_"))
            );
            const messagesSnapshot = await getDocs(messagesQuery);

            messagesSnapshot.docs.forEach((doc) => {
                const messageRef = doc.ref;
                batch.update(messageRef, { isArchived: true });
            });

            // Update chat user list
            const chatUserRef = doc(db, `users/${user.uid}/chat_users/${userId}`);
            batch.update(chatUserRef, { isBlocked: true, isArchived: true });

            await batch.commit();

            // Update local state immediately
            setChatUsers(prev => prev.map(chatUser =>
                chatUser.id === userId
                    ? { ...chatUser, isBlocked: true, isArchived: true }
                    : chatUser
            ));

            // Close menu after successful block
            setActiveChatMenu(null);
        } catch (error) {
            console.error("Kullanıcı engellenirken hata:", error);
        }
    };

    const handleUnblockUser = async (userId: string) => {
        if (!user) return;
        try {
            const batch = writeBatch(db);

            // Remove from blocked users
            const blockedUserRef = doc(db, `users/${user.uid}/blocked_users/${userId}`);
            batch.delete(blockedUserRef);

            // Update chat user list
            const chatUserRef = doc(db, `users/${user.uid}/chat_users/${userId}`);
            batch.update(chatUserRef, { isBlocked: false });

            await batch.commit();

            // Update local state immediately
            setChatUsers(prev => prev.map(chatUser =>
                chatUser.id === userId
                    ? { ...chatUser, isBlocked: false }
                    : chatUser
            ));

            // Close menu after successful unblock
            setActiveChatMenu(null);
        } catch (error) {
            console.error("Kullanıcı engeli kaldırılırken hata:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-white">
                <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                    <Sidebar />
                </div>
                <div className="flex-1">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar */}
            <div className="w-[20%] border-r border-gray-200 h-screen overflow-y-auto">
                <Sidebar />
            </div>

            {/* Messages Content */}
            <div className="flex-1 flex">
                {/* Users List */}
                <div className="w-1/3 border-r border-gray-200 h-screen overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Kullanıcı ara..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Archive Section */}
                    <div
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition"
                    >
                        <div className="flex items-center gap-2">
                            <Archive className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-700">Archived Chats</span>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${showArchived ? 'rotate-90' : ''}`} />
                    </div>

                    <div>
                        {(searchQuery ? searchResults : chatUsers)
                            .filter(user => showArchived ? user.isArchived : !user.isArchived)
                            .map((chatUser) => (
                                <div
                                    key={chatUser.id}
                                    onClick={() => !chatUser.isBlocked && setSelectedUser(chatUser)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition relative ${selectedUser?.id === chatUser.id ? "bg-gray-50" : ""} ${chatUser.isBlocked ? "opacity-50" : ""}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img
                                                src={chatUser.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                                alt="profile"
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold truncate ${chatUser.isBlocked ? "text-gray-500" : "text-gray-900"}`}>
                                                {chatUser.name}
                                                {chatUser.isBlocked && " (Engellendi)"}
                                            </p>
                                            <p className={`text-sm truncate ${chatUser.isBlocked ? "text-gray-400" : "text-gray-500"}`}>
                                                {chatUser.lastMessage || "Henüz mesaj yok"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {chatUser.lastMessageTime && (
                                                <p className="text-xs text-gray-500">
                                                    {chatUser.lastMessageTime.toDate().toLocaleTimeString()}
                                                </p>
                                            )}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => handleChatMenuClick(chatUser.id, e)}
                                                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-500" />
                                                </button>
                                                {activeChatMenu === chatUser.id && (
                                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                                                        <div className="px-2 py-1.5">
                                                            <p className="text-xs font-medium text-gray-500 px-2">Sohbet Seçenekleri</p>
                                                        </div>
                                                        <div className="border-t border-gray-100">
                                                            <button
                                                                onClick={(e) => handleChatArchive(chatUser.id)}
                                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                                                            >
                                                                <Archive className="w-4 h-4 text-gray-500" />
                                                                <span className="text-sm">Arşivle</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleChatDelete(chatUser.id)}
                                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-red-600 transition-colors duration-200"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span className="text-sm">Sohbeti Sil</span>
                                                            </button>
                                                        </div>
                                                        <div className="border-t border-gray-100">
                                                            {chatUser.isBlocked ? (
                                                                <button
                                                                    onClick={(e) => handleUnblockUser(chatUser.id)}
                                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-green-600 transition-colors duration-200"
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                    <span className="text-sm">Engeli Kaldır</span>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => handleBlockUser(chatUser.id)}
                                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-red-600 transition-colors duration-200"
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                    <span className="text-sm">Engelle</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                                                            >
                                                                <Flag className="w-4 h-4 text-gray-500" />
                                                                <span className="text-sm">Bildir</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col h-screen">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedUser.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                        alt="profile"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {selectedUser.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            @{selectedUser.username}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowChatMenu(!showChatMenu)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    >
                                        <MoreVertical className="w-5 h-5 text-gray-500" />
                                    </button>
                                    {showChatMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                                            <div className="px-2 py-1.5">
                                                <p className="text-xs font-medium text-gray-500 px-2">Sohbet Seçenekleri</p>
                                            </div>
                                            <div className="border-t border-gray-100">
                                                <button
                                                    onClick={handleArchiveChat}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                                                >
                                                    <Archive className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">Arşivle</span>
                                                </button>
                                                <button
                                                    onClick={handleDeleteChat}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-red-600 transition-colors duration-200"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="text-sm">Sohbeti Sil</span>
                                                </button>
                                            </div>
                                            <div className="border-t border-gray-100">
                                                <button
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                                                >
                                                    <Shield className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">Engelle</span>
                                                </button>
                                                <button
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 text-gray-700 transition-colors duration-200"
                                                >
                                                    <Flag className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">Bildir</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {Object.entries(groupedMessages).map(([date, messages]) => (
                                    <div key={date}>
                                        <div className="sticky top-0 bg-white py-2 text-center">
                                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                {date}
                                            </span>
                                        </div>
                                        <div className="space-y-4 mt-4">
                                            {messages.map((message) => (
                                                <MessageItem
                                                    key={message.id}
                                                    message={message}
                                                    onArchive={handleArchiveMessage}
                                                    onDelete={handleDeleteMessage}
                                                    isOwnMessage={message.senderId === user?.uid}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Mesajınızı yazın..."
                                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">
                                Mesajlaşmak için bir kullanıcı seçin
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 