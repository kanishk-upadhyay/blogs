import { formatDate } from "@/lib/date";

interface BlogCardProps {
    title: string;
    date: string | number | Date;
    description?: string;
    author?: string;
    onClick?: () => void;
}

const BlogCard = ({ title, date, description, author, onClick }: BlogCardProps) => {
    return (
        <div
            className="w-full p-4 space-y-2 group hover:cursor-pointer"
            onClick={onClick}
        >
            <div className="flex flex-col md:flex-row md:items-end md:gap-1 relative">
                <div className="text-xl md:text-2xl font-serif dark:text-neutral-100 text-neutral-700 group-hover:text-primary dark:group-hover:text-primary transition-all duration-500 ease-out leading-tight">
                    {title}
                </div>
                <span className="hidden md:block flex-1 border-b-[0.5px] border-dashed dark:border-neutral-600 border-neutral-400 group-hover:border-primary dark:group-hover:border-primary mb-[6px] min-w-[20px]"></span>
                <div className="mt-1 md:mt-0 dark:text-neutral-400 text-neutral-500 md:whitespace-nowrap uppercase group-hover:text-primary dark:group-hover:text-primary font-mono text-xs md:text-base">
                    {formatDate(date)}
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                {author && (
                    <span className="dark:text-neutral-500 text-neutral-400 font-mono">
                        @{author}
                    </span>
                )}
                {description && author && (
                    <span className="dark:text-neutral-600 text-neutral-300">•</span>
                )}
                {description && (
                    <div className="dark:text-neutral-400 text-neutral-500 group-hover:text-primary dark:group-hover:text-primary line-clamp-2 md:line-clamp-1">
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogCard;
