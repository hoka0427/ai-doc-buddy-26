import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";

interface GoogleDriveIntegrationProps {
  onFileSelect: (file: any) => void;
}

const GoogleDriveIntegration = ({ onFileSelect }: GoogleDriveIntegrationProps) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleDriveAuth = async () => {
    setLoading(true);
    try {
      toast.info("Próximamente: La integración con Google Drive estará disponible pronto");
    } catch (error: any) {
      toast.error(error.message || "Error al conectar con Google Drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-medium">Google Drive</span>
        </div>
        <Button
          onClick={handleGoogleDriveAuth}
          disabled={loading}
          variant="outline"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Conectar Google Drive
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Conecta tu Google Drive para analizar archivos desde la nube (solo lectura)
      </p>
    </Card>
  );
};

export default GoogleDriveIntegration;
