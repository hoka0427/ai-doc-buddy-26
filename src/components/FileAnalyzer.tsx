import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const FileAnalyzer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        
        const { data, error } = await supabase.functions.invoke("analyze-file", {
          body: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileContent: content.substring(0, 5000)
          }
        });

        if (error) throw error;
        setResult(data.analysis);
        toast.success("Archivo analizado correctamente");
      };

      reader.readAsText(file);
    } catch (error: any) {
      toast.error(error.message || "Error al analizar el archivo");
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analizador de Archivos</CardTitle>
        <CardDescription>Sube un archivo para analizarlo con IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <label htmlFor="file-upload" className="cursor-pointer">
            <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Haz clic para seleccionar un archivo
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo 5MB
            </p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={analyzing}
            />
          </label>
        </div>

        {analyzing && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Analizando archivo...</span>
          </div>
        )}

        {result && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Resultado del Análisis:</h3>
            <p className="text-sm whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};