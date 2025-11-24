import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileAnalyzer } from "./FileAnalyzer";
import { Translator } from "./Translator";
import { WikipediaChat } from "./WikipediaChat";
import { ImageGenerator } from "./ImageGenerator";
import { AIChat } from "./AIChat";
import { HistorySidebar } from "./HistorySidebar";
import { QuickActions } from "./QuickActions";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import logoMain from "@/assets/logo-main.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [showHistory, setShowHistory] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <HistorySidebar />
              </SheetContent>
            </Sheet>
            <img src={logoMain} alt="UPTT" className="h-12" />
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <aside className="hidden md:block">
            <HistorySidebar />
          </aside>

          <main className="space-y-6">
            <QuickActions onSelectAction={setActiveTab} />
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 gap-2">
                <TabsTrigger value="chat">Chat IA</TabsTrigger>
                <TabsTrigger value="wikipedia">Wikipedia</TabsTrigger>
                <TabsTrigger value="translator">Traductor</TabsTrigger>
                <TabsTrigger value="files">Archivos</TabsTrigger>
                <TabsTrigger value="images">Imágenes</TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-6">
                <AIChat />
              </TabsContent>

              <TabsContent value="wikipedia" className="mt-6">
                <WikipediaChat />
              </TabsContent>

              <TabsContent value="translator" className="mt-6">
                <Translator />
              </TabsContent>

              <TabsContent value="files" className="mt-6">
                <FileAnalyzer />
              </TabsContent>

              <TabsContent value="images" className="mt-6">
                <ImageGenerator />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
};