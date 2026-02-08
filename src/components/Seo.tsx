

type SeoProps = {
    title: string;
    description?: string;
    type?: "website" | "article";
    name?: string;
    image?: string;
};

export default function Seo({
    title,
    description = "A place for thoughts and ideas.",
    type = "website",
    name = "Blogs",
    image
}: SeoProps) {
    const siteTitle = "Blogs";
    const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`;

    // Use a default image if none provided (e.g., from public folder)
    // assuming icon.png is available as a fallback or logo.
    const metaImage = image || "/icon.png";

    return (
        <>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={name} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={metaImage} />
        </>
    );
}
