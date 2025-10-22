export interface Tag {
  id: string;
  name: string;
  createdAt: Date;
  newsCount?: number;
}

export interface TagFormData {
  name: string;
}

export interface TagStats {
  totalTags: number;
  activeTags: number;
  inactiveTags: number;
  totalNews: number;
}
