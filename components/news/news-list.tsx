import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { es } from "date-fns/locale";
import { NewsItem } from "@/types"; // adjust the path to your NewsItem type

export default async function NewsList() {
  const supabase = await createClient();

  // Fetch all news, newest first
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Error fetching news: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!news || news.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            No hay noticias publicadas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {news.map((item: NewsItem) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">
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
