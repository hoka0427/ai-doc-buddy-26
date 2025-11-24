import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

interface HistoryItem {
  id: string;
  conversation_type: string;
  user_message: string;
  ai_response: string;
  created_at: string;
}

export const HistorySidebar = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from("conversation_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setHistory(data);
    }
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      ai_chat: { label: "Chat", variant: "default" },
      wikipedia: { label: "Wikipedia", variant: "secondary" },
      translator: { label: "Traductor", variant: "outline" },
    };
    return badges[type] || { label: type, variant: "default" };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial
        </CardTitle>
        <CardDescription>Últimas 20 conversaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay historial aún
              </p>
            ) : (
              history.map((item) => {
                const badge = getTypeBadge(item.conversation_type);
                return (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <Badge variant={badge.variant as any}>{badge.label}</Badge>
                    <p className="text-sm line-clamp-2">{item.user_message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};