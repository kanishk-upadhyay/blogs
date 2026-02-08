import React, { useEffect, useMemo, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import type { Components } from "react-markdown";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  Eye,
  Edit2,
} from "lucide-react";
import getErrorMessage from "@/lib/errors";
import { checkSlugExists } from "@/lib/api";

export type PostFormValues = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  published: boolean;
};

type PostFormProps = {
  mode?: "create" | "edit";
  initial?: Partial<PostFormValues>;
  onSubmit: (values: PostFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
  submitLabel?: string;
  className?: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Memoize plugins outside component to prevent re-creation on every render
const REMARK_PLUGINS = [remarkGfm, remarkBreaks];

// Memoize components outside component
const MARKDOWN_COMPONENTS: Components = {
  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-2 mt-4" {...props} />,
};

export default function PostForm({
  mode = "create",
  initial,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
  className,
}: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? "",
    published: initial?.published ?? true,
  });

  const [activeTab, setActiveTab] = useState("write");
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref instead of document.querySelector
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep form in sync if initial changes (e.g., when loading edit data)
  useEffect(() => {
    setValues({
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      published: initial?.published ?? true,
    });
  }, [
    initial?.title,
    initial?.slug,
    initial?.excerpt,
    initial?.content,
    initial?.published,
  ]);

  const isSubmitting = submitting ?? localSubmitting;

  const canSubmit = useMemo(() => {
    return (
      values.title.trim().length > 0 &&
      values.content.trim().length > 0
    );
  }, [values.title, values.content]);

  const stats = useMemo(() => {
    const text = values.content.trim();
    return {
      chars: text.length,
      words: text ? text.split(/\s+/).length : 0,
    };
  }, [values.content]);

  function handleTitleChange(next: string) {
    setValues((prev) => {
      const nextState: PostFormValues = {
        ...prev,
        title: next,
      };
      // In create mode, sync slug with title
      if (mode === "create") {
        nextState.slug = slugify(next);
      }
      return nextState;
    });
  }

  const insertText = (
    before: string,
    after: string = "",
    defaultText: string = "",
  ) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = values.content;
    const selection = text.substring(start, end) || defaultText;

    const newText =
      text.substring(0, start) +
      before +
      selection +
      after +
      text.substring(end);
    setValues((prev) => ({ ...prev, content: newText }));

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selection.length,
      );
    }, 0);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setError(null);
    setLocalSubmitting(true);
    try {
      let finalSlug = values.slug;

      // For create mode, ensure uniqueness
      if (mode === "create") {
        let unique = false;
        let counter = 0;
        const originalSlug = finalSlug || slugify(values.title);
        let candidate = originalSlug;

        // Loop to find a unique slug
        while (!unique) {
          // If counter > 0, append it
          if (counter > 0) {
            candidate = `${originalSlug}-${counter}`;
          }

          // Check existence
          const exists = await checkSlugExists(candidate);
          if (!exists) {
            unique = true;
            finalSlug = candidate;
          } else {
            counter++;
          }
        }
      }

      await onSubmit({
        title: values.title.trim(),
        slug: finalSlug,
        excerpt: values.excerpt?.trim() || "",
        content: values.content,
        published: !!values.published,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save post"));
    } finally {
      setLocalSubmitting(false);
    }
  }

  return (
    <form
      className={["grid gap-6", className].filter(Boolean).join(" ")}
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Title
          </label>
          <Input
            value={values.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter post title"
            required
            disabled={isSubmitting}
            className="text-lg font-medium h-12"
          />
        </div>

        {/* Slug is now auto-generated and hidden from user input */}

        <div className="grid gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Excerpt (Optional)
          </label>
          <Input
            value={values.excerpt}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, excerpt: e.target.value }))
            }
            placeholder="Short summary for lists"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Content
          </label>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-2 flex items-center justify-between">
              <TabsList className="h-9">
                <TabsTrigger value="write" className="text-xs">
                  <Edit2 className="mr-2 h-3.5 w-3.5" /> Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">
                  <Eye className="mr-2 h-3.5 w-3.5" /> Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="write" className="mt-0">
              <div className="rounded-md border border-input shadow-sm focus-within:ring-1 focus-within:ring-ring">
                <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("**", "**", "bold")}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("*", "*", "italic")}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <div className="mx-1 h-4 w-px bg-border/50" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("# ", "", "Idx")}
                    title="Heading 1"
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("## ", "", "Idx")}
                    title="Heading 2"
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <div className="mx-1 h-4 w-px bg-border/50" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("- ", "", "Item")}
                    title="List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("> ", "", "Quote")}
                    title="Quote"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("```\n", "\n```", "code")}
                    title="Code Block"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <div className="mx-1 h-4 w-px bg-border/50" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("[", "](url)", "text")}
                    title="Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={() => insertText("![", "](url)", "alt info")}
                    title="Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  ref={contentTextareaRef}
                  name="content"
                  value={values.content}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Write your masterpiece..."
                  className="min-h-[200px] max-h-[500px] border-0 rounded-t-none resize-y focus-visible:ring-0 font-mono text-base px-4 py-3"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mt-2 flex justify-end text-xs text-muted-foreground">
                {stats.words} words · {stats.chars} characters
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <Card className="min-h-[240px] bg-muted/10">
                <CardContent className="prose max-w-none pt-6 dark:prose-invert">
                  {values.content ? (
                    <ReactMarkdown
                      remarkPlugins={REMARK_PLUGINS}
                      components={MARKDOWN_COMPONENTS}
                    >
                      {values.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground italic">
                      Nothing to preview yet...
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-6 mt-2">
          <label className="flex cursor-pointer select-none items-center gap-3 rounded-lg border border-transparent px-3 py-2 transition-colors hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-border">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={values.published}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, published: e.target.checked }))
                }
                disabled={isSubmitting}
                className="peer h-4 w-4 rounded border-primary text-primary shadow-sm focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="grid gap-0.5">
              <span className="text-sm font-medium leading-none">Publish immediately</span>
              <span className="text-xs text-muted-foreground">Post will be visible to everyone</span>
            </div>
          </label>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting
                ? mode === "edit"
                  ? "Saving..."
                  : "Creating..."
                : submitLabel ??
                (mode === "edit" ? "Save Changes" : "Create Post")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
