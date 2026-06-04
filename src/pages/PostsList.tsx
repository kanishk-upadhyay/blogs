import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getPosts } from "@/lib/api";
import type { Post } from "@/lib/api";
import BlogCard from "@/components/posts/BlogCard";
import { PostsListHeader } from "@/components/posts/PostsListHeader";
import { PostsListEmptyState } from "@/components/posts/PostsListEmptyState";
import { PostsListSkeleton } from "@/components/posts/PostsListSkeleton";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { toast } from "sonner";
import getErrorMessage from "@/lib/errors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import Seo from "@/components/Seo";

export default function PostsList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      setLoadingList(true);
      setError("");
      try {
        // Always fetch only published posts as requested
        const data = await getPosts(true);
        setPosts(data);
      } catch (e: unknown) {
        const msg = getErrorMessage(e, "Failed to load posts");
        setError(msg);
        toast.error(msg);
      } finally {
        setLoadingList(false);
      }
    }
    loadPosts();
  }, [searchParams]);

  // Memoize filtered posts to prevent recalculation on every render
  const filteredPosts = useMemo(() => {
    const query = searchParams.get("search")?.toLowerCase() || "";

    if (!query) return posts;

    return posts.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.excerpt?.toLowerCase().includes(query) ||
      p.author?.username.toLowerCase().includes(query)
    );
  }, [posts, searchParams]);

  const showCTA = !user && !searchParams.get("search");

  return (
    <div className="space-y-8">
      <Seo title="Home" description="Read the latest stories and ideas from our community." />
      {showCTA && (
        <div className="mx-auto max-w-4xl">
          <PostsListHeader />
        </div>
      )}

      <Card className="mx-auto max-w-4xl border-none shadow-none bg-transparent">
        <CardContent className="pt-0 px-0">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loadingList ? (
            <PostsListSkeleton />
          ) : filteredPosts.length === 0 ? (
            <PostsListEmptyState />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold tracking-tight">Latest Writings</h2>
              </div>
              <ul className="grid gap-4">
                {filteredPosts.map((p) => (
                  <li key={p.id}>
                    <BlogCard
                      title={p.title}
                      date={p.published_at || p.created_at || Date.now()}
                      description={p.excerpt || undefined}
                      author={p.author?.username}
                      onClick={() => navigate(`/posts/${p.slug}`)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

