import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logoHeader from "@/assets/logo-header.png";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("¡Correo de recuperación enviado! Revisa tu bandeja de entrada.");
        setIsResetPassword(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenido!");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("¡Cuenta creada! Ya puedes iniciar sesión.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={logoHeader} alt="UPTT Logo" className="h-20 mx-auto mb-4" />
          <CardTitle className="text-2xl">Sistema Académico UPTT</CardTitle>
          <CardDescription>
            {isResetPassword 
              ? "Recupera tu contraseña" 
              : isLogin 
              ? "Inicia sesión para continuar" 
              : "Crea tu cuenta"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!isResetPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsResetPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? "Cargando..." 
                : isResetPassword 
                ? "Enviar Correo de Recuperación"
                : isLogin 
                ? "Iniciar Sesión" 
                : "Registrarse"
              }
            </Button>
            <div className="space-y-2">
              {!isResetPassword ? (
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPassword(false);
                    setIsLogin(true);
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                >
                  Volver al inicio de sesión
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};