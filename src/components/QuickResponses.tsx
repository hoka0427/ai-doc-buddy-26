import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

interface QuickResponse {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface QuickResponsesProps {
  onSelect: (content: string) => void;
}

export const QuickResponses = ({ onSelect }: QuickResponsesProps) => {
  const [responses, setResponses] = useState<QuickResponse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const { data, error } = await supabase
      .from("quick_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading quick responses:", error);
      return;
    }

    setResponses(data || []);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    const { error } = await supabase
      .from("quick_responses")
      .insert({
        title: title.trim(),
        content: content.trim(),
        category,
      });

    if (error) {
      toast.error("Error al guardar");
      console.error(error);
      return;
    }

    toast.success("Respuesta rápida guardada");
    setTitle("");
    setContent("");
    setShowForm(false);
    loadResponses();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("quick_responses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error al eliminar");
      return;
    }

    toast.success("Eliminada");
    loadResponses();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Respuestas Rápidas</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="space-y-3 p-3 border rounded-lg">
            <Input
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Contenido de la respuesta"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="academico">Académico</SelectItem>
                <SelectItem value="tecnico">Técnico</SelectItem>
                <SelectItem value="administrativo">Administrativo</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave} className="w-full">
              Guardar
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {responses.map((response) => (
            <div
              key={response.id}
              className="group flex items-start gap-2 p-2 border rounded hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{response.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {response.content}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {response.category}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onSelect(response.content)}
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(response.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
