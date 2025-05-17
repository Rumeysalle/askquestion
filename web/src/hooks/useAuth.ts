import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Cookies from 'js-cookie';

export function useAuth() {
    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const syncUser = async () => {
            if (!user) {
                setUserData(null);
                setIsLoading(false);
                // Remove auth token cookie when user is null
                Cookies.remove('auth-token');
                return;
            }

            try {
                // Get and set auth token
                const token = await user.getIdToken();
                Cookies.set('auth-token', token, { expires: 7 }); // 7 days expiry

                // Check if user exists in Firestore
                const usersRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(usersRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (data.email !== user.email) {
                        const emailQuery = await getDoc(doc(db, 'users', user.uid));
                        if (emailQuery.exists()) {
                            router.push(`/profile/${emailQuery.id}`);
                            return;
                        }
                    }
                    setUserData(data);
                } else {
                    // Create new user if doesn't exist
                    const username = user.email?.split('@')[0] || 'anonim';
                    const newUserData = {
                        uid: user.uid,
                        email: user.email,
                        username,
                        name: username,
                        createdAt: serverTimestamp(),
                        photoURL: user.photoURL || 'https://i.ibb.co/wh9SNVZY/user.png'
                    };

                    await setDoc(usersRef, newUserData);
                    setUserData(newUserData);
                }
            } catch (error) {
                console.error('User sync error:', error);
                // Remove auth token on error
                Cookies.remove('auth-token');
            } finally {
                setIsLoading(false);
            }
        };

        syncUser();
    }, [user, router]);

    return {
        user,
        userData,
        loading: loading || isLoading
    };
} 