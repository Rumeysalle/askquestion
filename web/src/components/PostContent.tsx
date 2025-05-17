interface PostContentProps {
    content: string;
}

export default function PostContent({ content }: PostContentProps) {
    return (
        <div className="text-base text-gray-800 mb-4 whitespace-pre-wrap break-words">
            {content}
        </div>
    );
}
