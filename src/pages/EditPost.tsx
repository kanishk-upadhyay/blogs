import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostForm, { type PostFormValues } from "@/components/posts/PostForm";

import { getPost, updatePost } from "@/lib/api";
import type { Post } from "@/lib/api";
import getErrorMessage from "@/lib/errors";

import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function EditPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!slug) {
        setLoadError("Missing slug");
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getPost(slug);
        if (!cancelled) setPost(data);
      } catch (err) {
        if (!cancelled)
          setLoadError(getErrorMessage(err, "Failed to load post"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const initialValues = useMemo<Partial<PostFormValues>>(() => {
    if (!post) return {};
    return {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      published: !!post.published,
    };
  }, [post]);

  async function handleSubmit(values: PostFormValues) {
    if (!post) return;
    await updatePost(post.id, {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt || undefined,
      content: values.content,
      published: values.published,
    });
    toast.success("Post updated");
    navigate(`/posts/${values.slug}`, { replace: true });
  }

  return (
    <div className="grid gap-4">
      <div>
        <Button
          variant="ghost"
          onClick={() =>
            navigate(post ? `/posts/${post.slug}` : "/", { replace: true })
          }
          className="px-2"
        >
          <ArrowLeft className="mr-2" />
          Back
        </Button>
      </div>

      {loadError && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {loadError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-40 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ) : post ? (
            <PostForm
              mode="edit"
              initial={initialValues}
              onSubmit={handleSubmit}
              onCancel={() =>
                navigate(post ? `/posts/${post.slug}` : "/", { replace: true })
              }
              submitLabel="Save Changes"
            />
          ) : (
            <div className="text-sm text-muted-foreground">Post not found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
