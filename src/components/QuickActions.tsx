import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Globe, Languages, FileText, Image as ImageIcon } from "lucide-react";

interface QuickActionsProps {
  onSelectAction: (action: string) => void;
}

const actions = [
  { id: "chat", icon: MessageSquare, label: "Preguntar a IA", color: "text-primary" },
  { id: "wikipedia", icon: Globe, label: "Consultar Wikipedia", color: "text-secondary" },
  { id: "translator", icon: Languages, label: "Traducir Texto", color: "text-accent" },
  { id: "files", icon: FileText, label: "Analizar Archivo", color: "text-primary" },
  { id: "images", icon: ImageIcon, label: "Generar Imagen", color: "text-secondary" },
];

export const QuickActions = ({ onSelectAction }: QuickActionsProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              onClick={() => onSelectAction(action.id)}
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};