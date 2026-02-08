import { Skeleton } from "@/components/ui/skeleton";

export function PostsListSkeleton() {
    return (
        <ul className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                    <div className="w-3/4">
                        <Skeleton className="h-4 w-3/5" />
                        <div className="mt-2">
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                </li>
            ))}
        </ul>
    );
}
