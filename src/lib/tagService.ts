import { 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Tag, TagFormData } from '@/types/tag';

const TAGS_COLLECTION = 'tags';

export class TagService {
  // Create tag (or return existing)
  static async createTag(tagData: TagFormData): Promise<string> {
    try {
      // Check if tag already exists
      const existingTag = await this.getTagByName(tagData.name);
      if (existingTag) {
        return existingTag.id;
      }

      const docRef = await addDoc(collection(db, TAGS_COLLECTION), {
        name: tagData.name,
        createdAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Create tag error:', error);
      throw new Error('Erro ao criar tag');
    }
  }

  // Get all tags
  static async getAllTags(): Promise<Tag[]> {
    try {
      const tagsSnapshot = await getDocs(collection(db, TAGS_COLLECTION));
      const tags: Tag[] = [];
      
      tagsSnapshot.forEach((doc) => {
        const data = doc.data() as DocumentData;
        tags.push({
          id: doc.id,
          name: data.name || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          newsCount: 0
        });
      });

      return tags.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Get all tags error:', error);
      return [];
    }
  }

  // Get tag by name
  static async getTagByName(name: string): Promise<Tag | null> {
    try {
      const tagsQuery = query(
        collection(db, TAGS_COLLECTION),
        where('name', '==', name)
      );
      const tagsSnapshot = await getDocs(tagsQuery);
      
      if (tagsSnapshot.empty) {
        return null;
      }

      const doc = tagsSnapshot.docs[0];
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        name: data.name || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        newsCount: 0
      };
    } catch (error) {
      console.error('Get tag by name error:', error);
      return null;
    }
  }

  // Search tags by name
  static async searchTags(query: string): Promise<Tag[]> {
    try {
      const allTags = await this.getAllTags();
      return allTags.filter(tag => 
        tag.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Search tags error:', error);
      return [];
    }
  }

  // Create multiple tags from comma-separated string
  static async createTagsFromString(tagsString: string): Promise<string[]> {
    try {
      const tagNames = tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const tagIds: string[] = [];
      
      for (const tagName of tagNames) {
        const tagId = await this.createTag({ name: tagName });
        tagIds.push(tagId);
      }

      return tagIds;
    } catch (error) {
      console.error('Create tags from string error:', error);
      throw new Error('Erro ao criar tags');
    }
  }

  // Delete tag
  static async deleteTag(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TAGS_COLLECTION, id));
    } catch (error) {
      console.error('Delete tag error:', error);
      throw new Error('Erro ao deletar tag');
    }
  }

  // Get tag statistics
  static async getTagStats(): Promise<{ totalTags: number }> {
    try {
      const tags = await this.getAllTags();
      return {
        totalTags: tags.length
      };
    } catch (error) {
      console.error('Get tag stats error:', error);
      return { totalTags: 0 };
    }
  }
}