import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";

export function PostsListHeader() {
    const navigate = useNavigate();

    return (
        <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-8 md:p-12 text-center space-y-6 border border-white/5 shadow-sm">
            <div className="mx-auto bg-background/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm rotate-3">
                <PenTool className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2 max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
                    Share your story with the world.
                </h1>
                <p className="text-lg text-muted-foreground/80 md:text-xl">
                    Join our community of thinkers and writers. Start your blog today and
                    let your voice be heard.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                    size="lg"
                    className="rounded-full px-8 text-base h-12"
                    onClick={() => navigate("/register")}
                >
                    Get Started
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 text-base h-12 bg-background/50 backdrop-blur hover:bg-background/80"
                    onClick={() => navigate("/login")}
                >
                    Login
                </Button>
            </div>
        </div>
    );
}
