import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Metric } from "@/types"; // adjust path

export default async function MetricsTable() {
  const supabase = await createClient();

  const { data: metrics, error } = await supabase
    .from("metrics")
    .select("*")
    .order("month", { ascending: false });

  if (error || !metrics || metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas Detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            No hay métricas disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const getGrowthBadge = (current: number, previous: number) => {
    if (!previous) return null;
    const growth = ((current - previous) / previous) * 100;
    const isPositive = growth > 0;
    return (
      <Badge
        variant={isPositive ? "default" : "destructive"}
        className="text-xs"
      >
        {isPositive ? "+" : ""}
        {growth.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas Detalladas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mes</TableHead>
              <TableHead>Ingresos</TableHead>
              <TableHead>Clientes</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead>Promedio por Pedido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.slice(0, 12).map((metric: Metric, index: number) => {
              const previousMetric = metrics[index + 1];
              const avgOrderValue =
                metric.orders > 0 ? metric.revenue / metric.orders : 0;

              return (
                <TableRow key={metric.id}>
                  <TableCell className="font-medium">
                    {new Date(metric.month).toLocaleDateString("es", {
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{formatCurrency(metric.revenue)}</span>
                      {previousMetric &&
                        getGrowthBadge(metric.revenue, previousMetric.revenue)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{metric.customers.toLocaleString()}</span>
                      {previousMetric &&
                        getGrowthBadge(
                          metric.customers,
                          previousMetric.customers
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{metric.orders.toLocaleString()}</span>
                      {previousMetric &&
                        getGrowthBadge(metric.orders, previousMetric.orders)}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(avgOrderValue)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
