import { Search } from "lucide-react";

export function PostsListEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
                There are no published posts to show.
            </p>
        </div>
    );
}
