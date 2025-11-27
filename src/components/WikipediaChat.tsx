import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Mic, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";

export const WikipediaChat = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<{ text: string; source?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const { speak, stopSpeaking, isSpeaking } = useVoiceOutput();

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Por favor ingresa una consulta");
      return;
    }

    const queryText = query.trim();
    setLoading(true);
    
    try {
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
            onKeyPress={(e) => e.key === "Enter" && !loading && handleSearch()}
            disabled={loading}
          />
          <Button
            onClick={isListening ? stopListening : startListening}
            variant="outline"
            disabled={loading}
          >
            <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
          </Button>
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
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm whitespace-pre-wrap flex-1">{response.text}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => isSpeaking ? stopSpeaking() : speak(response.text)}
                  className="shrink-0"
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
