import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { getPost } from "@/lib/api";
import type { Post } from "@/lib/api";
import getErrorMessage from "@/lib/errors";
import { useAuth } from "@/contexts/AuthContext";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";

import { formatDate } from "@/lib/date";

export default function PostDetail() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!slug) {
        setError("Missing slug");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getPost(slug);
        if (!cancelled) setPost(data);
      } catch (e: any) {
        if (!cancelled) setError(getErrorMessage(e, "Failed to load post"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const seoTitle = post ? post.title : "Post";
  const seoDesc = post?.excerpt || "Read this post on Blogs.";

  return (
    <div className="mx-auto max-w-3xl pt-8 pb-16">
      <Seo title={seoTitle} description={seoDesc} type="article" />
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/", { replace: true })}
          className="pl-0 hover:bg-transparent hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : post ? (
        <article className="prose prose-zinc dark:prose-invert max-w-none">
          {/* Header Section */}
          <header className="mb-10 not-prose">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {!post.published && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                  Draft
                </Badge>
              )}
              {post.updated_at && post.updated_at !== post.published_at && (
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  Updated {formatDate(post.updated_at)}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-6 text-foreground break-words">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium mb-8">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between border-y border-border py-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                  {post.author?.username?.slice(0, 2).toUpperCase() || "??"}
                </div>
                <div className="leading-none">
                  <p className="font-bold text-foreground">
                    <Link to={`/users/${post.author?.username}`} className="hover:text-primary transition-colors">
                      {post.author?.username}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {post.published_at
                      ? formatDate(post.published_at)
                      : "Unpublished"}
                  </p>
                </div>
              </div>

              {user && user.username === post.author?.username && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/posts/${post.slug}/edit`, { replace: true })}
                >
                  Edit Post
                </Button>
              )}
            </div>
          </header>

          {/* Content Section */}
          <div className="prose-xl prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Post not found</h2>
          <p className="text-muted-foreground">The post you are looking for does not exist or has been removed.</p>
        </div>
      )}
    </div>
  );
}
