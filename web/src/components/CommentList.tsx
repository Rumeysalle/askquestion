import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function CommentList({ postId }: { postId: string }) {
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "posts", postId, "comments"),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setComments(data);
        });

        return () => unsubscribe();
    }, [postId]);

    return (
        <div className="mt-2 space-y-2">
            {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 items-start">
                    <img
                        src={comment.photoURL}
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="bg-gray-100 p-2 rounded-lg">
                        <p className="text-sm font-semibold">{comment.username}</p>
                        <p className="text-sm">{comment.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
