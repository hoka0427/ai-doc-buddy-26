import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

export const WikipediaChat = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<{ text: string; source?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Por favor ingresa una consulta");
      return;
    }

    const queryText = query.trim();
    setLoading(true);
    
    try {
      // Check content filter first
      const { data: filterData, error: filterError } = await supabase.functions.invoke("content-filter", {
        body: { content: queryText },
      });

      if (filterError) throw filterError;

      if (!filterData.allowed) {
        toast.error(filterData.reason || "Contenido no permitido");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("wikipedia-search", {
        body: { query: queryText }
      });

      if (error) throw error;
      setResponse({ text: data.response, source: data.source });
      toast.success("Búsqueda completada");
    } catch (error: any) {
      toast.error(error.message || "Error en la búsqueda");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat con Wikipedia</CardTitle>
        <CardDescription>Pregunta sobre cualquier tema y obtén información de Wikipedia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="¿Qué quieres saber?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {response && (
          <div className="space-y-2">
            {response.source && (
              <div className="text-xs text-muted-foreground">
                Fuente: {response.source}
              </div>
            )}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{response.text}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
