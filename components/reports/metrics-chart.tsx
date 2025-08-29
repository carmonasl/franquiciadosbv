import { createClient } from "@/lib/supabase/server";
import { MetricsChartClient } from "@/components/reports/metrics-chart-client";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: metrics } = await supabase
    .from("metrics")
    .select("*")
    .order("month", { ascending: true });

  return (
    <div>
      <h1>Informes</h1>
      <MetricsChartClient metrics={metrics || []} />
    </div>
  );
}
