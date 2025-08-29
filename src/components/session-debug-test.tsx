"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

interface SessionDebugInfo {
    session: {
        exists: boolean;
        userId?: string;
        email?: string;
        error?: string;
    };
    user: {
        exists: boolean;
        userId?: string;
        email?: string;
        error?: string;
    };
    localStorage: {
        keys: string[];
    };
    cookies: string;
}

interface SessionDebugError {
    error: string;
}

export function SessionDebugTest() {
    const [sessionInfo, setSessionInfo] = useState<SessionDebugInfo | SessionDebugError | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            console.log("🧪 Manual session check starting...");

            try {
                // Check session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                // Check user
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                const info: SessionDebugInfo = {
                    session: {
                        exists: !!session,
                        userId: session?.user?.id,
                        email: session?.user?.email,
                        error: sessionError?.message
                    },
                    user: {
                        exists: !!user,
                        userId: user?.id,
                        email: user?.email,
                        error: userError?.message
                    },
                    localStorage: {
                        keys: typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.includes('supabase')) : []
                    },
                    cookies: typeof document !== 'undefined' ? document.cookie : 'N/A'
                };

                console.log("🧪 Session check results:", info);
                setSessionInfo(info);
            } catch (error) {
                console.error("🧪 Session check error:", error);
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                setSessionInfo({ error: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("🧪 Auth state change detected:", event, session?.user?.id);
            checkSession(); // Re-run the check
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return <div>Loading session debug...</div>;

    return (
        <div className="bg-yellow-100 p-4 rounded-lg border mb-4">
            <h3 className="font-bold mb-2">🧪 Session Debug Results:</h3>
            <pre className="text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(sessionInfo, null, 2)}
            </pre>
        </div>
    );
}