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
    DocumentData
} from "firebase/firestore";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, Send } from "lucide-react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: any;
    senderName: string;
    senderPhoto: string;
    participants: string[];
}

interface ChatUser {
    id: string;
    name: string;
    username: string;
    photoURL: string;
    lastMessage?: string;
    lastMessageTime?: any;
}

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

    // Tüm kullanıcıları getir
    useEffect(() => {
        if (!user) return;

        const fetchUsers = async () => {
            try {
                const usersQuery = query(collection(db, "users"));
                const usersSnapshot = await getDocs(usersQuery);
                const users = usersSnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(userData => userData.id !== user.uid) as ChatUser[];

                // Her kullanıcı için son mesajı getir
                const usersWithLastMessage = await Promise.all(
                    users.map(async (userData) => {
                        const participants = [user.uid, userData.id].sort();
                        const messagesQuery = query(
                            collection(db, "messages"),
                            where("participants", "array-contains", participants[0]),
                            orderBy("createdAt", "desc"),
                            limit(1)
                        );
                        const messagesSnapshot = await getDocs(messagesQuery);
                        const lastMessage = messagesSnapshot.docs
                            .map(doc => doc.data() as Message)
                            .find(msg =>
                                msg.participants.includes(user.uid) &&
                                msg.participants.includes(userData.id)
                            );

                        return {
                            ...userData,
                            lastMessage: lastMessage?.content,
                            lastMessageTime: lastMessage?.createdAt
                        };
                    })
                );

                setChatUsers(usersWithLastMessage);
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

        const messagesQuery = query(
            collection(db, "messages"),
            where("participants", "array-contains", user.uid),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messages = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Message))
                .filter(msg =>
                    (msg.senderId === user.uid && msg.receiverId === selectedUser.id) ||
                    (msg.senderId === selectedUser.id && msg.receiverId === user.uid)
                );
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
            user.name.toLowerCase().includes(searchQuery) ||
            user.username.toLowerCase().includes(searchQuery)
        );
        setSearchResults(results);
    };

    // Mesaj gönderme
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedUser || !newMessage.trim()) return;

        try {
            await addDoc(collection(db, "messages"), {
                content: newMessage,
                senderId: user.uid,
                receiverId: selectedUser.id,
                participants: [user.uid, selectedUser.id],
                createdAt: serverTimestamp(),
                senderName: user.displayName || user.email?.split("@")[0],
                senderPhoto: user.photoURL
            });

            setNewMessage("");
        } catch (error) {
            console.error("Mesaj gönderilirken hata:", error);
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

                    <div className="divide-y divide-gray-200">
                        {(searchQuery ? searchResults : chatUsers).map((chatUser) => (
                            <div
                                key={chatUser.id}
                                onClick={() => setSelectedUser(chatUser)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedUser?.id === chatUser.id ? "bg-gray-50" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={chatUser.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                        alt="profile"
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {chatUser.name}
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {chatUser.lastMessage || "Henüz mesaj yok"}
                                        </p>
                                    </div>
                                    {chatUser.lastMessageTime && (
                                        <p className="text-xs text-gray-500">
                                            {chatUser.lastMessageTime.toDate().toLocaleTimeString()}
                                        </p>
                                    )}
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
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedUser.photoURL || "https://i.ibb.co/wh9SNVZY/user.png"}
                                        alt="profile"
                                        className="w-10 h-10 rounded-full"
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
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.senderId === user?.uid
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg p-3 ${message.senderId === user?.uid
                                                ? "bg-blue-500 text-white"
                                                : "bg-gray-100 text-gray-900"
                                                }`}
                                        >
                                            <p>{message.content}</p>
                                            <p className="text-xs mt-1 opacity-70">
                                                {message.createdAt?.toDate().toLocaleTimeString()}
                                            </p>
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