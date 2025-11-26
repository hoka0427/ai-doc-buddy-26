import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor describe la imagen que deseas generar");
      return;
    }

    const promptText = prompt.trim();
    setLoading(true);
    
    try {
      // Check content filter first
      const { data: filterData, error: filterError } = await supabase.functions.invoke("content-filter", {
        body: { content: promptText },
      });

      if (filterError) throw filterError;

      if (!filterData.allowed) {
        toast.error(filterData.reason || "Contenido no permitido");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: promptText }
      });

      if (error) throw error;
      setImageUrl(data.imageUrl);
      toast.success("Imagen generada correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al generar la imagen");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generador de Imágenes</CardTitle>
        <CardDescription>Crea imágenes únicas con IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Describe la imagen que quieres crear..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Generando imagen...</span>
          </div>
        )}

        {imageUrl && !loading && (
          <div className="rounded-lg overflow-hidden border">
            <img src={imageUrl} alt="Generated" className="w-full h-auto" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
