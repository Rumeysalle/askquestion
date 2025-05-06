import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function UserHoverCard({ userId }: { userId?: string }) {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const docSnap = await getDoc(doc(db, "users", userId));
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            } catch (error) {
                console.error("Kullanıcı verisi alınamadı:", error);
            }
        };

        fetchUser();
    }, [userId]);

    if (!userData) return null;

    return (
        <div className="absolute z-50 bg-white shadow-lg rounded-xl p-4 text-black w-72 border border-gray-300">
            <div className="flex items-center gap-3">
                <img
                    src={userData.photoURL}
                    width={50}
                    height={50}
                    className="rounded-full"
                    alt="avatar"
                />
                <div>
                    <p className="font-bold">{userData.username}</p>
                    <p className="text-sm text-gray-600">{userData.email}</p>
                </div>
            </div>
            {userData.bio && (
                <p className="text-sm mt-2">{userData.bio}</p>
            )}
        </div>
    );
}
