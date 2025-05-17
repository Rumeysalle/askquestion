import { MessageCircle } from "lucide-react";

interface CommentTriggerProps {
    commentsCount: number;
    onClick: () => void;
}

export default function CommentTrigger({ commentsCount, onClick }: CommentTriggerProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 mt-2"
        >
            <MessageCircle className="w-4 h-4" />
            <span>{commentsCount} yorum</span>
        </button>
    );
}