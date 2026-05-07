import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, SubscriptionTier } from '../types';

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isPro: boolean;
  upgradeToPro: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create profile if it doesn't exist
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          subscriptionTier: 'free',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        setDoc(userRef, initialProfile).catch(e => {
          console.error("Profile creation failed", e);
          handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile sync error", error);
      // Only throw/handle if it's not a temporary glitch
      if (error.code !== 'unavailable') {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    });

    return () => unsubscribeProfile();
  }, [user?.uid]);

  const upgradeToPro = async () => {
    if (!user) return;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userRef, {
        subscriptionTier: 'premium',
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const isPro = profile?.subscriptionTier === 'premium';

  return (
    <UserContext.Provider value={{ user, profile, loading, isPro, upgradeToPro }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
