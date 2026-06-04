import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPosts, type Post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import getErrorMessage from "@/lib/errors";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Calendar, MoreVertical } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { updatePost, deletePost } from "@/lib/api";
import Seo from "@/components/Seo";
import { formatDate } from "@/lib/date";
import { DeletePostDialog } from "@/components/posts/DeletePostDialog";
import { UnpublishPostDialog } from "@/components/posts/UnpublishPostDialog";

export default function UserProfile() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [postToUnpublish, setPostToUnpublish] = useState<Post | null>(null);

    useEffect(() => {
        async function fetchUserPosts() {
            if (!username) return;

            setLoading(true);
            setError(null);
            try {
                // Since API doesn't support filtering by user yet, we fetch all and filter client-side
                // Ideally API should support /posts?author=username
                const allPosts = await getPosts(false); // Fetch all to include drafts if current user
                const userPosts = allPosts.filter(p => p.author?.username === username);

                // Filter out drafts if looking at someone else's profile
                const displayedPosts = userPosts.filter(p => p.published || (user?.username === username));
                setPosts(displayedPosts);
            } catch (e) {
                const msg = getErrorMessage(e, "Failed to load user posts");
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        }

        fetchUserPosts();
    }, [username, user]);

    async function handleConfirmDelete() {
        if (!postToDelete) return;
        try {
            await deletePost(postToDelete.id);
            toast.success("Deleted");
            setPostToDelete(null);
            // Refresh posts
            setPosts(posts.filter(p => p.id !== postToDelete.id));
        } catch (e: unknown) {
            const msg = getErrorMessage(e, "Failed to delete post");
            toast.error(msg);
        }
    }

    async function handleConfirmUnpublish() {
        if (!postToUnpublish) return;
        try {
            await updatePost(postToUnpublish.id, { published: false });
            toast.success("Unpublished");
            setPostToUnpublish(null);
            // Update local state to reflect change
            setPosts(posts.map(p => p.id === postToUnpublish.id ? { ...p, published: false } : p));
        } catch (e: unknown) {
            const msg = getErrorMessage(e, "Failed to unpublish");
            toast.error(msg);
        }
    }

    async function handleTogglePublish(post: Post) {
        try {
            const newStatus = !post.published;
            await updatePost(post.id, { published: newStatus });
            toast.success(newStatus ? "Published" : "Unpublished");
            setPosts(posts.map(p => p.id === post.id ? { ...p, published: newStatus } : p));
        } catch (e: unknown) {
            const msg = getErrorMessage(e, "Failed to update post");
            toast.error(msg);
        }
    }

    if (!username) return null;

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <Seo title={`${username}'s Profile`} description={`Read blog posts by ${username}.`} />
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 px-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">{username}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {loading ? "Loading..." : `${posts.length} posts published`}
                        </p>
                    </div>
                </CardHeader>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Latest Posts</h2>
                    <Separator className="flex-1" />
                </div>

                {loading ? (
                    <div className="grid gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-4 rounded-lg border p-4">
                                <div className="space-y-2 w-full">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-lg">
                        No posts found for this user.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {posts.map((p) => (
                            <Card
                                key={p.id}
                                className="cursor-pointer transition-colors hover:bg-muted/50"
                                onClick={() => navigate(`/posts/${p.slug}`)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold leading-none tracking-tight">
                                                {p.title}
                                            </h3>
                                            {p.excerpt && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {p.excerpt}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {formatDate(p.published_at || p.created_at || Date.now())}
                                                </span>
                                                {!p.published && (
                                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                                        Draft
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {user && user.username === username && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Open actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenuItem onClick={() => navigate(`/posts/${p.slug}/edit`)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/posts/${p.slug}`)}>
                                                        View
                                                    </DropdownMenuItem>
                                                    {p.published ? (
                                                        <DropdownMenuItem onClick={() => setPostToUnpublish(p)}>
                                                            Unpublish
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleTogglePublish(p)} className="text-primary">
                                                            Publish
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setPostToDelete(p)}>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <UnpublishPostDialog
                post={postToUnpublish}
                open={!!postToUnpublish}
                onOpenChange={(open) => !open && setPostToUnpublish(null)}
                onConfirm={handleConfirmUnpublish}
            />

            <DeletePostDialog
                post={postToDelete}
                open={!!postToDelete}
                onOpenChange={(open) => !open && setPostToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
