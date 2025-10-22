export type RoadmapPriority = 'high' | 'medium' | 'low';
export type RoadmapStatus = 'open' | 'in_progress' | 'completed';

export interface RoadmapRequest {
  id: string;
  title: string;
  description?: string;
  content: string; // HTML content from rich editor
  priority: RoadmapPriority;
  status: RoadmapStatus;
  authorId: string;
  authorName: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoadmapStatusChange {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  oldStatus: RoadmapStatus;
  newStatus: RoadmapStatus;
  timestamp: Date;
  comment?: string;
}

export interface RoadmapFormData {
  title: string;
  description?: string;
  content: string;
  priority: RoadmapPriority;
  coverImage?: string;
}

export interface RoadmapStats {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface RoadmapFilters {
  status?: RoadmapStatus;
  priority?: RoadmapPriority;
  authorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
