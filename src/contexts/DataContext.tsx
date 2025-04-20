import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { postsAPI, eventsAPI, questionsAPI } from '@/services/api';

// Types
interface Post {
  _id: string;
  title: string;
  content: string;
  type: 'blog' | 'interview' | 'meeting';
  author: {
    _id: string;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  meetingDate?: string;
  meetingTime?: string;
  likes: number;
}

interface DataContextType {
  posts: Post[];
  events: Post[];
  questions: Post[];
  loading: boolean;
  error: string | null;
  addPost: (post: Omit<Post, '_id'>) => Promise<void>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  getPostsByType: (type: Post['type']) => Post[];
  getUpcomingMeetings: () => Post[];
  refreshPosts: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Post[]>([]);
  const [questions, setQuestions] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsResponse, eventsResponse, questionsResponse] = await Promise.all([
        postsAPI.getAll(),
        eventsAPI.getAll(),
        questionsAPI.getAll(),
      ]);

      setPosts(postsResponse.data);
      setEvents(eventsResponse.data);
      setQuestions(questionsResponse.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    posts,
    events,
    questions,
    loading,
    error,
    addPost: async (post: Omit<Post, '_id'>) => {
      try {
        const response = await postsAPI.create(post);
        setPosts((prev) => [response.data, ...prev]);
        toast.success('Post created successfully!');
      } catch (error: any) {
        console.error('Failed to create post:', error);
        const errorMessage = error.response?.data?.message || 'Failed to create post';
        toast.error(errorMessage);
        throw error;
      }
    },
    updatePost: async (id: string, updatedPost: Partial<Post>) => {
      try {
        const response = await postsAPI.update(id, updatedPost);
        setPosts((prev) =>
          prev.map((post) => (post._id === id ? response.data : post))
        );
        toast.success('Post updated successfully!');
      } catch (error: any) {
        console.error('Failed to update post:', error);
        const errorMessage = error.response?.data?.message || 'Failed to update post';
        toast.error(errorMessage);
        throw error;
      }
    },
    deletePost: async (id: string) => {
      try {
        await postsAPI.delete(id);
        setPosts((prev) => prev.filter((post) => post._id !== id));
        toast.success('Post deleted successfully!');
      } catch (error: any) {
        console.error('Failed to delete post:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete post';
        toast.error(errorMessage);
        throw error;
      }
    },
    addComment: async (postId: string, content: string) => {
      if (!user) {
        toast.error('You must be logged in to add a comment');
        return;
      }

      try {
        const response = await postsAPI.addComment(postId, content);
        setPosts((prev) =>
          prev.map((post) => (post._id === postId ? response.data : post))
        );
        toast.success('Comment added successfully!');
      } catch (error: any) {
        console.error('Failed to add comment:', error);
        const errorMessage = error.response?.data?.message || 'Failed to add comment';
        toast.error(errorMessage);
        throw error;
      }
    },
    getPostsByType: (type: Post['type']) => posts.filter((post) => post.type === type),
    getUpcomingMeetings: () => {
      const today = new Date().toISOString().split('T')[0];
      return posts
        .filter(
          (post) =>
            post.type === 'meeting' &&
            post.meetingDate &&
            post.meetingDate >= today
        )
        .sort((a, b) =>
          a.meetingDate && b.meetingDate
            ? a.meetingDate.localeCompare(b.meetingDate)
            : 0
        );
    },
    refreshPosts: async () => {
      try {
        const response = await postsAPI.getAll();
        setPosts(response.data);
      } catch (error: any) {
        console.error('Error refreshing posts:', error);
        const errorMessage = error.response?.data?.message || 'Failed to refresh posts';
        toast.error(errorMessage);
      }
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export { DataProvider, useData };
