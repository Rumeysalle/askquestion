
import {
    Heart,
    MessageCircle,
    Bookmark,
    BookmarkCheck,
    Share2,
} from "lucide-react";

interface PostActionsProps {
    hasLiked: boolean;
    isSaved: boolean;
    likesCount: number;
    commentsCount: number;
    onLike: () => void;
    onToggleComment: () => void;
    onSave: () => void;
    onShare: () => void;
}

export default function PostActions({
    hasLiked,
    isSaved,
    likesCount,
    commentsCount,
    onLike,
    onToggleComment,
    onSave,
    onShare,
}: PostActionsProps) {
    return (
        <div className="flex items-center justify-between mt-2 text-gray-700">
            <div className="flex items-center gap-4">
                <button onClick={onLike} className="flex items-center gap-1 hover:text-red-500">
                    <Heart className="w-5 h-5" fill={hasLiked ? "red" : "none"} />
                    <span>{likesCount}</span>
                </button>

                <button onClick={onToggleComment} className="flex items-center gap-1 hover:text-blue-500">
                    <MessageCircle className="w-5 h-5" />
                    <span>{commentsCount}</span>
                </button>

                <button onClick={onSave} className="hover:text-yellow-500">
                    {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
            </div>

            <button onClick={onShare} className="hover:text-green-600">
                <Share2 className="w-5 h-5" />
            </button>
        </div>
    );
}
