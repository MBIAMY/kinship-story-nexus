
import React, { useState } from 'react';
import Header from '@/components/Header';
import FamilyGraph from '@/components/FamilyGraph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  
  return (
    <div className="min-h-screen flex flex-col bg-family-cream/30">
      <Header />
      
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-4xl mx-auto mb-6">
          <h1 className="text-4xl font-bold text-center text-family-navy mb-2">
            Nexus Familial
          </h1>
          <p className="text-center text-xl text-muted-foreground mb-6">
            Préservez et partagez l'héritage de votre famille
          </p>
        </div>
        
        {showIntro && (
          <Card className="mb-6 bg-gradient-to-br from-family-blue to-family-navy text-white animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">Bienvenue dans votre arbre généalogique interactif</CardTitle>
              <CardDescription className="text-white/80">
                Explorez les connexions familiales, partagez des histoires, et préservez votre patrimoine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cette application vous permet de visualiser les liens entre les membres de votre famille et de partager les histoires qui définissent votre héritage culturel.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button variant="secondary" onClick={() => setShowIntro(false)}>
                  Explorer l'arbre généalogique
                </Button>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  Ajouter un membre
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Comment utiliser</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium">Navigation</h3>
                  <p className="text-muted-foreground">
                    Utilisez la souris pour naviguer. Faites glisser les nœuds pour réorganiser.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Zoom</h3>
                  <p className="text-muted-foreground">
                    Utilisez la molette de défilement pour zoomer et dézoomer.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Détails</h3>
                  <p className="text-muted-foreground">
                    Cliquez sur un membre pour voir ses détails et histoires.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Légende</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-family-blue"></div>
                  <span className="text-sm">Membres avec photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-family-lightBlue"></div>
                  <span className="text-sm">Membres sans photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 w-8 bg-family-warmGray"></div>
                  <span className="text-sm">Relations parent-enfant</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <FamilyGraph />
          </div>
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

export default Index;
