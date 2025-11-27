import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "español", name: "Español" },
  { code: "inglés", name: "Inglés" },
  { code: "francés", name: "Francés" },
  { code: "alemán", name: "Alemán" },
  { code: "italiano", name: "Italiano" },
  { code: "portugués", name: "Portugués" },
];

export const Translator = () => {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [sourceLang, setSourceLang] = useState("español");
  const [targetLang, setTargetLang] = useState("inglés");
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast.error("Por favor ingresa un texto para traducir");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text, sourceLang, targetLang }
      });

      if (error) throw error;
      setTranslation(data.translation);
      toast.success("Traducción completada");
    } catch (error: any) {
      toast.error(error.message || "Error en la traducción");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setText(translation);
    setTranslation(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Traductor</CardTitle>
        <CardDescription>Traduce texto entre diferentes idiomas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={sourceLang} onValueChange={setSourceLang}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={swapLanguages}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          placeholder="Escribe el texto a traducir..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[150px]"
        />

        <Button onClick={handleTranslate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traduciendo...
            </>
          ) : (
            "Traducir"
          )}
        </Button>

        {translation && (
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Traducción:</h3>
            <p className="text-sm whitespace-pre-wrap">{translation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};