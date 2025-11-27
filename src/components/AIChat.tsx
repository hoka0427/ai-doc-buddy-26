import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Mic, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { QuickQuestions } from "./QuickQuestions";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useVoiceInput();
  const { speak, stopSpeaking, isSpeaking } = useVoiceOutput();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data: filterData, error: filterError } = await supabase.functions.invoke("content-filter", {
        body: { content: userMessage },
      });

      if (filterError) throw filterError;

      if (!filterData.allowed) {
        toast.error(filterData.reason || "Contenido no permitido");
        setMessages((prev) => prev.slice(0, -1));
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: userMessage, conversationType: "ai_chat" }
      });

      if (error) throw error;

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el mensaje");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Chat con IA</CardTitle>
          <CardDescription>Asistente académico inteligente</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto space-y-4 pr-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                ¡Hola! ¿En qué puedo ayudarte hoy?
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap flex-1">{message.content}</p>
                    {message.role === "assistant" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
                        className="shrink-0"
                      >
                        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
              disabled={loading}
            />
            <Button
              onClick={isListening ? stopListening : startListening}
              variant="outline"
              disabled={loading}
            >
              <Mic className={`h-4 w-4 ${isListening ? 'text-red-500' : ''}`} />
            </Button>
            <Button onClick={handleSend} disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <QuickQuestions onSelect={(content) => setInput(content)} />
    </div>
  );
};
