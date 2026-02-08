/**
 * Format a date string into a human-readable format
 * e.g., "Oct 24, 2024"
 */
export function formatDate(dateString: string | null | undefined | number | Date): string {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Get relative time until a date (e.g., "in 3 days")
 */
export function getRelativeTime(dateString: string | null | undefined): string {
    if (!dateString) return "Unknown";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (diffMs < 0) {
        return "Expired";
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Less than a minute";
    if (diffHours < 1) return `in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
    if (diffDays < 1) return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;

    return `in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}
