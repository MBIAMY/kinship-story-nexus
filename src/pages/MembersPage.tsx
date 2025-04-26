
import React from 'react';
import Header from '@/components/Header';
import ProfileSection from '@/components/ProfileSection';
import AddStoryForm from '@/components/AddStoryForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MembersPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-family-cream/30">
      <Header />
      
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-4xl mx-auto mb-6">
          <h1 className="text-3xl font-bold text-center text-family-navy mb-2">
            Membres & Histoires
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Découvrez l'histoire de votre famille à travers ses membres et les récits partagés
          </p>
        </div>
        
        <Tabs defaultValue="profiles" className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="profiles">Tous les membres</TabsTrigger>
              <TabsTrigger value="add-story">Ajouter une histoire</TabsTrigger>
            </TabsList>
            
            <Button>Ajouter un membre</Button>
          </div>
          
          <TabsContent value="profiles">
            <ProfileSection />
          </TabsContent>
          
          <TabsContent value="add-story">
            <AddStoryForm />
          </TabsContent>
        </Tabs>
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

export default MembersPage;
