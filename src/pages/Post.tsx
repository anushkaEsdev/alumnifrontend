import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Share2, Bookmark, Clock, User, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { toast } from 'react-hot-toast';
import { postsAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addComment } = useData();
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchPost();
    } else {
      setError('Invalid post ID');
      setLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    if (post && user) {
      // Check if the current user has liked the post
      setIsLiked(post.likes.some((likeId: string) => likeId === user.id));
    }
  }, [post, user]);
  
  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching post with ID:', id);
      const response = await postsAPI.getById(id!);
      console.log('Post data received:', response.data);
      setPost(response.data);
    } catch (error: any) {
      console.error('Error fetching post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load post';
      setError(errorMessage);
      toast.error(errorMessage);
      // Don't navigate away immediately, let user see the error
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like');
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        await postsAPI.unlike(post._id);
      } else {
        await postsAPI.like(post._id);
      }
      
      // Refresh the post to get updated likes
      await fetchPost();
      setIsLiked(!isLiked);
      toast.success(isLiked ? 'Post unliked' : 'Post liked');
    } catch (error: any) {
      console.error('Error liking/unliking post:', error);
      toast.error(error.response?.data?.message || 'Failed to update like');
    }
  };
  
  const handleBookmark = () => {
    if (!user) {
      toast.error('Please login to bookmark');
      navigate('/login');
      return;
    }

    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Post unbookmarked' : 'Post bookmarked');
  };
  
  const handleComment = async () => {
    if (!user) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await addComment(post._id, comment);
      setComment('');
      toast.success('Comment added');
      // Refresh the post to show the new comment
      fetchPost();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/blog')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Post Not Found</CardTitle>
            <CardDescription>The post you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/blog')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <Link to="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">By {post.author.username}</span>
            <span className="text-gray-400">•</span>
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-gray-600">{formatDate(post.createdAt)}</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-primary' : ''}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              {post?.likes?.length || 0} Likes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={isBookmarked ? 'text-primary' : ''}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmark
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        
        <div className="prose max-w-none mb-8">
          {post.content}
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <div className="space-y-4">
            {post.comments && post.comments.map((comment: any) => (
              <Card key={comment._id}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{comment.author.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Add a Comment</h2>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your comment..."
            className="mb-4"
          />
          <Button onClick={handleComment}>Post Comment</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Post; 