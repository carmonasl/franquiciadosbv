// components/reports/metrics-chart-client.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Metric } from "@/types";

interface Props {
  metrics: Metric[];
}

export function MetricsChartClient({ metrics }: Props) {
  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No hay datos disponibles para mostrar gráficos
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics.slice(-12).map((m) => ({
    month: new Date(m.month).toLocaleDateString("es", {
      month: "short",
      year: "numeric",
    }),
    revenue: m.revenue,
    customers: m.customers,
    orders: m.orders,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`€${value}`, "Ingresos"]} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customers & Orders Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes y Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#10b981" name="Clientes" />
              <Bar dataKey="orders" fill="#f59e0b" name="Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
