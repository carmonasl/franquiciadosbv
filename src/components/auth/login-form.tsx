"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("🧹 Clearing any existing session data...");

            // Clear all authentication data (non-blocking)
            try {
                supabase.auth.signOut().catch(err => console.warn("Sign out warning:", err));

                // Clear localStorage items related to Supabase
                if (typeof window !== 'undefined') {
                    Object.keys(localStorage).forEach(key => {
                        if (key.includes('supabase')) {
                            try {
                                localStorage.removeItem(key);
                                console.log(`🗑️ Cleared localStorage: ${key}`);
                            } catch (err) {
                                console.warn(`Could not clear ${key}:`, err);
                            }
                        }
                    });
                }

                // Clear cookies related to Supabase
                if (typeof document !== 'undefined') {
                    document.cookie.split(";").forEach(cookie => {
                        const eqPos = cookie.indexOf("=");
                        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                        if (name.includes('supabase') || name.includes('sb-') || name.includes('jwt')) {
                            try {
                                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                                console.log(`🗑️ Cleared cookie: ${name}`);
                            } catch (err) {
                                console.warn(`Could not clear cookie ${name}:`, err);
                            }
                        }
                    });
                }

                console.log("✅ Session cleanup completed");
            } catch (cleanupErr) {
                console.warn("⚠️ Cleanup had some issues, but continuing:", cleanupErr);
            }

            // Small delay for cleanup, but don't wait too long
            await new Promise(resolve => setTimeout(resolve, 200));

            console.log("🚀 Attempting login with:", email);

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log("📦 Login response:", {
                hasData: !!data,
                hasUser: !!data?.user,
                hasSession: !!data?.session,
                userId: data?.user?.id,
                email: data?.user?.email,
                error: error?.message
            });

            if (error) {
                setError(error.message);
                console.error("❌ Login error:", error);
            } else if (data?.user && data?.session) {
                console.log("✅ Login successful!");
                console.log("👤 User ID:", data.user.id);
                console.log("📧 Email:", data.user.email);

                // Wait a bit for session storage, then redirect
                setTimeout(() => {
                    console.log("🚀 Redirecting to dashboard...");
                    router.push("/dashboard");
                }, 800);

            } else {
                setError("No user returned from login");
                console.warn("⚠️ Login without proper user data:", data);
            }
        } catch (err) {
            console.error("🔥 Exception in login:", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(`Unexpected error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Iniciar sesión</CardTitle>
                <CardDescription className="text-center">
                    Ingresa tus credenciales para acceder al portal
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}