import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import getErrorMessage from "@/lib/errors";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(username, password, remember);
            toast.success("Welcome back!");
            navigate("/");
        } catch (error: unknown) {
            const msg = getErrorMessage(error, "Login failed");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoFocus
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm">
                                Remember me
                            </label>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
