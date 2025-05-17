import Link from "next/link";
import UserHoverCard from "./UserHoverCard";


interface PostHeaderProps {
    username: string;
    userId: string;
    createdAt: any; // timestamp
}

export default function PostHeader({ username, userId, createdAt }: PostHeaderProps) {
    if (!userId) {
        console.warn('PostHeader: userId is undefined');
        return null;
    }

    const formattedDate = new Date(createdAt?.seconds * 1000).toLocaleDateString();

    return (
        <div className="flex items-center gap-2">
            <UserHoverCard userId={userId}>
                <Link href={`/profile/${userId}`} className="font-semibold hover:underline text-gray-900">
                    {username}
                </Link>
            </UserHoverCard>
            <span className="text-sm text-gray-400">{formattedDate}</span>
        </div>
    );
}
