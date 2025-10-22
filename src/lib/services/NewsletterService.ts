import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export interface NewsletterSubscription {
  id?: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'pending';
  subscribedAt: Date;
  unsubscribedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  source: string; // 'website', 'admin', etc.
}

export interface CreateSubscriptionData {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  source?: string;
}

class NewsletterService {
  private collectionRef = collection(db, 'newsletter_subscriptions');

  async subscribe(data: CreateSubscriptionData): Promise<NewsletterSubscription> {
    try {
      // Verificar se o email já está inscrito
      const existingSubscription = await this.getSubscriptionByEmail(data.email);
      if (existingSubscription) {
        if (existingSubscription.status === 'active') {
          throw new Error('Este e-mail já está inscrito na nossa newsletter.');
        } else if (existingSubscription.status === 'unsubscribed') {
          throw new Error('Este e-mail foi removido da nossa newsletter. Entre em contato para reativar.');
        }
      }

      const subscriptionData = {
        email: data.email.toLowerCase().trim(),
        status: 'active',
        subscribedAt: serverTimestamp(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        source: data.source || 'website'
      };

      const docRef = await addDoc(this.collectionRef, subscriptionData);
      
      return {
        id: docRef.id,
        email: data.email,
        status: 'active',
        subscribedAt: new Date(),
        source: data.source || 'website'
      };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  }

  async getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null> {
    try {
      const q = query(this.collectionRef, where('email', '==', email.toLowerCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        email: data.email,
        status: data.status,
        subscribedAt: data.subscribedAt?.toDate() || new Date(),
        unsubscribedAt: data.unsubscribedAt?.toDate(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        source: data.source
      };
    } catch (error) {
      console.error('Error getting subscription by email:', error);
      return null;
    }
  }

  async getAllSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          status: data.status,
          subscribedAt: data.subscribedAt?.toDate() || new Date(),
          unsubscribedAt: data.unsubscribedAt?.toDate(),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          source: data.source
        };
      });
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      return [];
    }
  }

  async getActiveSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const q = query(this.collectionRef, where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          status: data.status,
          subscribedAt: data.subscribedAt?.toDate() || new Date(),
          unsubscribedAt: data.unsubscribedAt?.toDate(),
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          source: data.source
        };
      });
    } catch (error) {
      console.error('Error getting active subscriptions:', error);
      return [];
    }
  }

  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    unsubscribed: number;
    pending: number;
  }> {
    try {
      const subscriptions = await this.getAllSubscriptions();
      
      return {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        unsubscribed: subscriptions.filter(s => s.status === 'unsubscribed').length,
        pending: subscriptions.filter(s => s.status === 'pending').length
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      return {
        total: 0,
        active: 0,
        unsubscribed: 0,
        pending: 0
      };
    }
  }
}

export const newsletterService = new NewsletterService();
