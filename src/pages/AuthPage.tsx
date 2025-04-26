
import React from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-family-cream/30">
      <Header />
      
      <main className="flex-1 container mx-auto p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-family-navy mb-2">
            Accès à Nexus Familial
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Connectez-vous ou inscrivez-vous pour préserver l'héritage de votre famille
          </p>
          
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="login">Connexion</TabsTrigger>
                  <TabsTrigger value="register">Inscription</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="bg-family-navy text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            Nexus Familial - Préservez et partagez l'héritage de votre famille
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
