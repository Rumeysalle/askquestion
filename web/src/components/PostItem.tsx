
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../lib/firebase";
import {
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    increment,
    collection,
    query as firestoreQuery,
    where,
    orderBy,
    getDocs,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import CommentModal from "./CommentModal";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostAction";
import ShareMenu from "./ShareMenu";
import CommentTrigger from "./CommentTrigger";
import { Post, User } from "../types/post";

interface PostItemProps {
    post: Post;
    onShare?: () => void;
}

export default function PostItem({ post, onShare }: PostItemProps) {
    if (!post || !post.senderId || !post.senderName) {
        console.warn("Eksik post verisi:", post);
        return <></>;
    }

    const [user] = useAuthState(auth);
    const userId = user?.uid || "";
    const hasLiked = post.like?.users?.includes(userId);
    const [showModal, setShowModal] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [recentContacts, setRecentContacts] = useState<User[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [likesCount, setLikesCount] = useState<number>(post.like?.count || 0);
    const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);

    useEffect(() => {
        const fetchRecentContacts = async () => {
            if (!user) return;
            try {
                const messagesQuery = firestoreQuery(
                    collection(db, "messages"),
                    where("participants", "array-contains", user.uid),
                    orderBy("lastMessageAt", "desc")
                );
                const messagesSnapshot = await getDocs(messagesQuery);
                const contacts = new Set<string>();
                messagesSnapshot.docs.forEach((doc) => {
                    const data = doc.data();
                    const otherUserId = data.participants.find((id: string) => id !== user.uid);
                    if (otherUserId) contacts.add(otherUserId);
                });
                const userPromises = Array.from(contacts).map(async (contactId) => {
                    const userDoc = await getDoc(doc(db, "users", contactId));
                    return { id: contactId, ...userDoc.data() } as User;
                });
                const users = await Promise.all(userPromises);
                setRecentContacts(users);
            } catch (error) {
                console.error("Error loading recent contacts:", error);
            }
        };
        fetchRecentContacts();
    }, [user]);

    useEffect(() => {
        const checkIfSaved = async () => {
            if (!user) return;
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();
                const savedPosts = userData?.savedPosts || [];
                setIsSaved(savedPosts.includes(post.id));
            } catch (error) {
                console.error("Error checking saved post:", error);
            }
        };
        checkIfSaved();
    }, [user, post.id]);

    return (
        <div className="bg-[#F5F5F5] text-gray-900 rounded-xl p-4 mb-4 shadow-sm border border-gray-300">
            <div className="flex items-center gap-3 mb-2">
                <img
                    src={post.senderPhoto || "https://i.ibb.co/wh9SNVZY/user.png"}
                    alt={post.senderName}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <PostHeader
                    username={post.senderName}
                    userId={post.senderId}
                    createdAt={post.createdAt}
                />
            </div>
            <PostContent content={post.content} />
            <PostActions
                hasLiked={hasLiked}
                isSaved={isSaved}
                likesCount={likesCount}
                commentsCount={commentsCount}
                onLike={() => { }}
                onToggleComment={() => setShowModal(true)}
                onSave={() => { }}
                onShare={() => setShowShareMenu(true)}
            />
            {showShareMenu && (
                <ShareMenu
                    userId={userId}
                    post={post}
                    recentContacts={recentContacts}
                    searchResults={searchResults}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onClose={() => setShowShareMenu(false)}
                />
            )}
            <CommentTrigger
                commentsCount={commentsCount}
                onClick={() => setShowModal(true)}
            />
            {showModal && <CommentModal post={post} onClose={() => setShowModal(false)} />}
        </div>
    );
}
