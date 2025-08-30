import MetricsChart from "@/components/reports/metrics-chart";
import MetricsTable from "@/components/reports/metrics-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, ShoppingCart, Euro } from "lucide-react";

export default function ReportsPage() {
  // Datos de ejemplo
  const summaryStats = [
    {
      title: "Ingresos Totales",
      value: "€45,231",
      change: "+12.5%",
      icon: Euro,
      positive: true,
    },
    {
      title: "Nuevos Clientes",
      value: "1,429",
      change: "+8.2%",
      icon: Users,
      positive: true,
    },
    {
      title: "Pedidos",
      value: "892",
      change: "-2.4%",
      icon: ShoppingCart,
      positive: false,
    },
    {
      title: "Crecimiento",
      value: "15.3%",
      change: "+3.1%",
      icon: TrendingUp,
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Título de la página */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
        <p className="text-gray-600">
          Análisis detallado del rendimiento de tu franquicia
        </p>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card
            key={stat.title}
            className="bg-white border border-[#159a93]/30 rounded-2xl shadow-sm p-4 hover:shadow-md transition"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#159a93]">
                {stat.title}
              </CardTitle>
              <stat.icon
                className={`h-4 w-4 ${
                  stat.positive ? "text-green-600" : "text-red-600"
                }`}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p
                className={`text-xs ${
                  stat.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {stat.change} vs mes anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos y tabla */}
      <MetricsChart />
      <MetricsTable />
    </div>
  );
}
