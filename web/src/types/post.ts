export interface Post {
    id: string;
    content: string;
    createdAt: any; // Firestore Timestamp
    senderId: string;
    senderName: string;
    senderPhoto?: string;
    like: {
        count: number;
        users: string[];
    };
    comments?: Comment[];
}

export interface Comment {
    id: string;
    text: string;
    userId: string;
    username: string;
    userPhoto: string;
    createdAt: any; // Firestore Timestamp
}

export interface User {
    id: string;
    username: string;
    photoURL?: string;
    email?: string;
}

export interface Message {
    id: string;
    participants: string[];
    lastMessage: string;
    lastMessageAt: any; // Firestore Timestamp
} 