import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Loader2, Send, Mic, Volume2, VolumeX } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { QuickQuestions } from "./QuickQuestions";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";
import GoogleDriveIntegration from "./GoogleDriveIntegration";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const FileAnalyzer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const { speak, stopSpeaking, isSpeaking } = useVoiceOutput();

  useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    setMessages([]);
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
        setMessages([{ role: "assistant", content: data.analysis }]);
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

  const handleAskQuestion = async () => {
    if (!question.trim() || !result) {
      toast.error("Debes analizar un archivo primero y escribir una pregunta");
      return;
    }

    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `Basándote en este análisis de archivo: "${result}". Responde esta pregunta: ${question}`,
          conversationType: "file_analysis",
        },
      });

      if (error) throw error;

      const assistantMessage: Message = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || "Error al procesar");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Analizador de Archivos</CardTitle>
          <CardDescription>Sube un archivo local o desde Google Drive para analizarlo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleDriveIntegration onFileSelect={(file) => console.log('Selected file:', file)} />
          
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Haz clic para seleccionar un archivo local
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

          {messages.length > 0 && (
            <div className="space-y-3">
              <div className="max-h-96 overflow-y-auto space-y-3 p-4 bg-muted/50 rounded-lg">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground ml-8"
                        : "bg-card mr-8"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm whitespace-pre-wrap flex-1">{msg.content}</p>
                      {msg.role === "assistant" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => isSpeaking ? stopSpeaking() : speak(msg.content)}
                          className="shrink-0"
                        >
                          {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-center p-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Textarea
                  placeholder="Haz una pregunta sobre el archivo..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskQuestion();
                    }
                  }}
                  rows={2}
                  disabled={loading}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    variant="outline"
                    size="icon"
                    disabled={loading}
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
                  </Button>
                  <Button
                    onClick={handleAskQuestion}
                    disabled={loading || !question.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <QuickQuestions onSelect={(content) => setQuestion(content)} />
    </div>
  );
};
