/**
 * Simple API client for blog posts using fetch against /api
 * Assumes Vite dev proxy is configured or backend served at the same origin.
 */

export type User = {
  id: number;
  username: string;
  is_active: boolean;
  created_at?: string | null;
  session_expires?: string | null;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  published: boolean;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  author?: User | null;
};

type CreatePostPayload = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published?: boolean;
};

type UpdatePostPayload = Partial<CreatePostPayload>;

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // Include cookies for authentication
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  // Attempt to parse body even on non-OK to surface server error messages
  let data: unknown = null;
  const isJson =
    res.headers.get("content-type")?.includes("application/json") ?? false;
  if (isJson) {
    try {
      data = await res.json();
    } catch {
      // ignore parse errors
    }
  } else {
    try {
      data = await res.text();
    } catch {
      // ignore parse errors
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status} ${res.statusText})`;
    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      if (typeof obj.message === "string" && obj.message.trim()) {
        message = obj.message;
      } else if (typeof obj.error === "string" && obj.error.trim()) {
        message = obj.error;
      }
    }
    throw new Error(message);
  }

  return data as T;
}

/**
 * Health check
 */
export async function getHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/health");
}

/**
 * List posts
 * If publishedOnly is true (default), returns only published posts.
 */
export async function getPosts(publishedOnly: boolean = true): Promise<Post[]> {
  const qs = publishedOnly ? "" : "?published=false";
  return request<Post[]>(`/posts${qs}`);
}

/**
 * Get a single post by slug
 */
export async function getPost(slug: string): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(slug)}`);
}

/**
 * Create a new post
 */
export async function createPost(payload: CreatePostPayload): Promise<Post> {
  return request<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update a post by ID
 */
export async function updatePost(
  postId: number,
  payload: UpdatePostPayload,
): Promise<Post> {
  return request<Post>(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a post by ID
 */
export async function deletePost(
  postId: number,
): Promise<{ deleted: boolean }> {
  return request<{ deleted: boolean }>(`/posts/${postId}`, {
    method: "DELETE",
  });
}

/**
 * Check if a post slug already exists.
 * Returns true if the post is found (HTTP 200), false if not found (HTTP 404).
 * Throws for other HTTP errors or network failures.
 */
export async function checkSlugExists(slug: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, {
    method: "GET",
  });

  if (res.status === 404) return false;

  if (!res.ok) {
    let msg = "";
    try {
      msg = (await res.text()).trim();
    } catch {
      // ignore parse errors
    }
    throw new Error(msg || `Request failed (${res.status} ${res.statusText})`);
  }

  return true;
}

// ============================================================================
// Authentication Endpoints
// ============================================================================

/**
 * Register a new user
 */
export async function register(
  username: string,
  password: string,
): Promise<User> {
  return request<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Login user
 */
export async function login(
  username: string,
  password: string,
  remember?: boolean,
): Promise<User> {
  return request<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password, remember: remember ?? false }),
  });
}

/**
 * Logout current user
 */
export async function logout(): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<{ user: User | null }> {
  return request<{ user: User | null }>("/auth/me");
}
