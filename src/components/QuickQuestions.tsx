import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface QuickQuestion {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface QuickQuestionsProps {
  onSelect: (question: string) => void;
}

export const QuickQuestions = ({ onSelect }: QuickQuestionsProps) => {
  const [questions, setQuestions] = useState<QuickQuestion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("quick_responses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar preguntas");
      return;
    }

    setQuestions(data || []);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Completa todos los campos");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("quick_responses").insert({
      title,
      content,
      category,
      user_id: session.user.id,
    });

    if (error) {
      toast.error("Error al guardar pregunta");
      return;
    }

    toast.success("Pregunta guardada");
    setTitle("");
    setContent("");
    setCategory("general");
    setShowForm(false);
    loadQuestions();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("quick_responses").delete().eq("id", id);

    if (error) {
      toast.error("Error al eliminar pregunta");
      return;
    }

    toast.success("Pregunta eliminada");
    loadQuestions();
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Preguntas Rápidas</CardTitle>
          </div>
          <Button
            size="sm"
            variant={showForm ? "ghost" : "default"}
            onClick={() => setShowForm(!showForm)}
            className="h-8"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: ¿Cómo calcular...?"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm">Pregunta</Label>
              <Input
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu pregunta completa"
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="matematicas">Matemáticas</SelectItem>
                  <SelectItem value="ciencias">Ciencias</SelectItem>
                  <SelectItem value="historia">Historia</SelectItem>
                  <SelectItem value="tecnologia">Tecnología</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full h-9" size="sm">
              Guardar Pregunta
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay preguntas guardadas
            </p>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                className="group flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <button
                  onClick={() => onSelect(question.content)}
                  className="flex-1 text-left space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">{question.category}</span>
                  </div>
                  <p className="text-sm font-medium">{question.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {question.content}
                  </p>
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(question.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
