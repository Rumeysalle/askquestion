import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../types/post';

interface UserHoverCardProps {
    userId: string;
    children: React.ReactNode;
}

export default function UserHoverCard({ userId, children }: UserHoverCardProps) {
    const [user, setUser] = useState<User | null>(null);
    const [showCard, setShowCard] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                console.warn('UserHoverCard: userId is undefined');
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setUser({ id: userDoc.id, ...userDoc.data() } as User);
                } else {
                    console.warn(`UserHoverCard: No user found with id ${userId}`);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, [userId]);

    if (!userId) {
        return <>{children}</>;
    }

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShowCard(true)}
            onMouseLeave={() => setShowCard(false)}
        >
            {children}
            {showCard && user && (
                <div className="absolute z-50 top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.photoURL || 'https://i.ibb.co/wh9SNVZY/user.png'}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-semibold">{user.username}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
