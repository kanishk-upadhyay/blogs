import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "@/components/layout/Layout";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load page components
const PostsList = lazy(() => import("@/pages/PostsList"));
const PostDetail = lazy(() => import("@/pages/PostDetail"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const NewPost = lazy(() => import("@/pages/NewPost"));
const EditPost = lazy(() => import("@/pages/EditPost"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));

const RouteLoader = () => (
  <div className="mx-auto max-w-4xl space-y-6 pt-8">
    <Skeleton className="h-12 w-3/4" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);



export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="blog-theme">
      <AuthProvider>
        <Toaster richColors />
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<PostsList />} />
                <Route path="/users/:username" element={<UserProfile />} />
                <Route path="/posts/:slug" element={<PostDetail />} />
                <Route
                  path="/new"
                  element={
                    <ProtectedRoute>
                      <NewPost />
                    </ProtectedRoute>
                  }
                />
                <Route path="/posts/:slug/edit" element={
                  <ProtectedRoute>
                    <EditPost />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
