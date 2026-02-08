import { useNavigate } from "react-router-dom";

import { createPost } from "@/lib/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PostForm, { type PostFormValues } from "@/components/posts/PostForm";

import { toast } from "sonner";

export default function NewPost() {
  const navigate = useNavigate();

  async function handleCreate(values: PostFormValues) {
    const created = await createPost({
      title: values.title,
      slug: values.slug,
      content: values.content,
      excerpt: values.excerpt,
      published: values.published,
    });
    toast.success("Post created");
    navigate(`/posts/${created.slug}`);
  }

  return (
    <Card className="mx-auto max-w-4xl border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-3xl">New Post</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <PostForm
          mode="create"
          onSubmit={handleCreate}
          onCancel={() => navigate("/")}
          submitLabel="Create Post"
        />
      </CardContent>
    </Card>
  );
}
