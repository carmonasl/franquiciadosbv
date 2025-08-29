"use client";

import { useEffect, useState } from "react";

export function DirectSupabaseTest() {
    const [testResults, setTestResults] = useState<string[]>([]);

    useEffect(() => {
        const runTests = async () => {
            const results: string[] = [];

            try {
                // Test 1: Check environment variables
                results.push(`🌍 NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing'}`);
                results.push(`🔑 NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}`);

                // Test 2: Try importing Supabase
                try {
                    const { supabase } = await import("@/lib/supabase/client");
                    results.push(`📦 Supabase import: ${supabase ? '✅ Success' : '❌ Failed'}`);
                    results.push(`🔧 Supabase auth: ${supabase?.auth ? '✅ Present' : '❌ Missing'}`);

                    if (supabase?.auth) {
                        // Test 3: Try getting session
                        try {
                            const { data, error } = await supabase.auth.getSession();
                            results.push(`📋 Session check: ${data ? '✅ Success' : '❌ Failed'}`);
                            results.push(`👤 Has session: ${data.session ? '✅ Yes' : '❌ No'}`);
                            if (error) results.push(`❌ Session error: ${error.message}`);
                        } catch (sessionError) {
                            const errorMsg = sessionError instanceof Error ? sessionError.message : 'Unknown error';
                            results.push(`❌ Session check exception: ${errorMsg}`);
                        }
                    }
                } catch (importError) {
                    const errorMsg = importError instanceof Error ? importError.message : 'Unknown error';
                    results.push(`❌ Supabase import failed: ${errorMsg}`);
                }

                // Test 4: Check localStorage
                if (typeof window !== 'undefined') {
                    const lsKeys = Object.keys(localStorage).filter(k => k.includes('supabase'));
                    results.push(`💾 LocalStorage supabase keys: ${lsKeys.length > 0 ? lsKeys.join(', ') : 'None'}`);
                }

                // Test 5: Check cookies
                if (typeof document !== 'undefined') {
                    const cookies = document.cookie.split(';').filter(c => c.includes('supabase'));
                    results.push(`🍪 Supabase cookies: ${cookies.length > 0 ? cookies.length : 'None'}`);
                }

            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                results.push(`💥 Test suite error: ${errorMsg}`);
            }

            setTestResults(results);
            console.log("🧪 Direct Supabase test results:", results);
        };

        runTests();
    }, []);

    return (
        <div className="bg-red-100 p-4 rounded-lg border mb-4">
            <h3 className="font-bold text-red-800 mb-2">🧪 Direct Supabase Test Results:</h3>
            <div className="text-xs font-mono space-y-1">
                {testResults.map((result, i) => (
                    <div key={i} className={result.includes('❌') ? 'text-red-600' : 'text-green-600'}>
                        {result}
                    </div>
                ))}
            </div>
        </div>
    );
}