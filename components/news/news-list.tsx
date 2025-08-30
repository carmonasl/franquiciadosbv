import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { es } from "date-fns/locale";
import { NewsItem } from "@/types"; // ajusta la ruta según tu proyecto

export default async function NewsList() {
  const supabase = await createClient();

  // Fetch all news, newest first
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card className="bg-white border border-[#159a93]/30 rounded-2xl shadow-sm p-4">
        <CardContent className="pt-6 text-red-600">
          Error al cargar noticias: {error.message}
        </CardContent>
      </Card>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Card className="bg-white border border-[#159a93]/30 rounded-2xl shadow-sm p-4">
        <CardContent className="pt-6 text-center text-gray-500">
          No hay noticias publicadas
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {news.map((item: NewsItem) => (
        <Card
          key={item.id}
          className="bg-white border border-[#159a93]/30 rounded-2xl shadow-sm hover:shadow-md transition"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl text-[#159a93]">
                  {item.title}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-[#159a93]/10 text-[#159a93] border-none">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
