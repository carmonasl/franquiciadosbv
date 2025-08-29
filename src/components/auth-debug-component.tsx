"use client";

import { useAuth } from "@/hooks/use-auth"; // Adjust path as needed
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function AuthDebugComponent() {
    const { user, profile, loading, debugInfo } = useAuth();
    interface ManualProfileData {
        data?: unknown;
        error?: string;
    }

    const [manualProfileData, setManualProfileData] = useState<ManualProfileData | null>(null);
    const [manualLoading, setManualLoading] = useState(false);

    const testDirectProfileFetch = async () => {
        if (!user?.id) return;

        setManualLoading(true);
        try {
            console.log("🧪 Manual profile fetch test...");

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            console.log("🧪 Manual fetch result:", { data, error });
            setManualProfileData({ data, error: error?.message });
        } catch (err) {
            console.error("🧪 Manual fetch exception:", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
            setManualProfileData({ error: errorMessage });
        } finally {
            setManualLoading(false);
        }
    };

    const clearAllSessionData = async () => {
        try {
            console.log("🧹 Manually clearing all session data...");

            // Sign out from Supabase
            await supabase.auth.signOut();

            // Clear localStorage
            if (typeof window !== 'undefined') {
                Object.keys(localStorage).forEach(key => {
                    if (key.includes('supabase')) {
                        localStorage.removeItem(key);
                        console.log(`🗑️ Cleared localStorage: ${key}`);
                    }
                });
            }

            // Clear cookies
            if (typeof document !== 'undefined') {
                document.cookie.split(";").forEach(cookie => {
                    const eqPos = cookie.indexOf("=");
                    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                    if (name.includes('supabase') || name.includes('sb-') || name.includes('jwt')) {
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                        console.log(`🗑️ Cleared cookie: ${name}`);
                    }
                });
            }

            console.log("✅ All session data cleared");

            // Refresh the page to see the changes
            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (err) {
            console.error("❌ Error clearing session data:", err);
        }
    };

    return (
        <div className="bg-gray-100 p-4 rounded-lg border-2 border-red-300 mb-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">🐛 Auth Debug Info</h3>

            <div className="space-y-3 text-sm">
                <div>
                    <strong>Loading:</strong> {loading ? "✅ Yes" : "❌ No"}
                </div>

                <div>
                    <strong>User:</strong> {user ? `✅ ${user.email} (${user.id})` : "❌ None"}
                </div>

                <div>
                    <strong>Profile from Hook:</strong> {
                        profile ? `✅ ${JSON.stringify(profile)}` : "❌ Null/Undefined"
                    }
                </div>

                {debugInfo && (
                    <div>
                        <strong>Debug Info:</strong>
                        <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={clearAllSessionData}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                        🧹 Clear All Session Data
                    </button>

                    <button
                        onClick={testDirectProfileFetch}
                        disabled={!user || manualLoading}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {manualLoading ? "Testing..." : "Test Direct Profile Fetch"}
                    </button>
                </div>

                {manualProfileData && (
                    <div>
                        <strong>Manual Fetch Result:</strong>
                        <pre className="bg-yellow-100 p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(manualProfileData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}