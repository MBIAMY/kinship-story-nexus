
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { GitGraph, Settings, TreePine, Users } from 'lucide-react';
import { toast } from 'sonner';
import TreePermissions from '@/components/permissions/TreePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyTreeData } from '@/models/types';

// Schéma de validation pour la création d'un arbre
const createTreeSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().optional(),
});

type CreateTreeFormValues = z.infer<typeof createTreeSchema>;

const TreeManagementPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [trees, setTrees] = useState<FamilyTreeData[]>([
    {
      id: 'tree-1',
      name: 'Famille Dupont',
      description: 'L\'arbre généalogique principal de la famille Dupont',
      createdAt: new Date(2023, 5, 15).toISOString(),
      updatedAt: new Date(2023, 5, 15).toISOString(),
      ownerId: '123'
    },
    {
      id: 'tree-2',
      name: 'Branche Martin',
      description: 'La branche maternelle des Martin',
      createdAt: new Date(2024, 2, 8).toISOString(),
      updatedAt: new Date(2024, 2, 8).toISOString(),
      ownerId: '123'
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<string | null>(null);
  
  // Configuration du formulaire
  const form = useForm<CreateTreeFormValues>({
    resolver: zodResolver(createTreeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Redirection vers la page de connexion si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fonction pour créer un nouvel arbre
  const handleCreateTree = (data: CreateTreeFormValues) => {
    // Dans une application réelle, ici vous feriez un appel à votre API Java Spring Boot
    
    const newTree: FamilyTreeData = {
      id: `tree-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: user?.id || ''
    };
    
    setTrees([...trees, newTree]);
    form.reset();
    setIsDialogOpen(false);
    toast.success(`L'arbre "${data.name}" a été créé avec succès`);
  };

  // Fonction pour supprimer un arbre
  const handleDeleteTree = (treeId: string) => {
    const treeToDelete = trees.find(tree => tree.id === treeId);
    setTrees(trees.filter(tree => tree.id !== treeId));
    
    // Dans une application réelle, ici vous feriez un appel à votre API Java Spring Boot
    if (treeToDelete) {
      toast.success(`L'arbre "${treeToDelete.name}" a été supprimé`);
    }
  };

  // Fonction pour ouvrir l'arbre dans l'éditeur
  const openTreeEditor = (treeId: string) => {
    // Redirection vers l'éditeur d'arbre avec l'ID de l'arbre
    navigate(`/arbre/${treeId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-family-cream/30">
      <Header />
      
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-5xl mx-auto mb-6">
          <h1 className="text-3xl font-bold text-center text-family-navy mb-2">
            Vos Arbres Généalogiques
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Créez, gérez et partagez vos arbres généalogiques avec votre famille
          </p>
          
          <div className="flex justify-end mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <TreePine className="mr-2 h-4 w-4" />
                  Créer un nouvel arbre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouvel arbre généalogique</DialogTitle>
                  <DialogDescription>
                    Donnez un nom à votre nouvel arbre familial et ajoutez une description optionnelle.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateTree)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l'arbre</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Famille Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optionnel)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Une brève description de cet arbre" 
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">Créer l'arbre</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {trees.length === 0 ? (
            <Card className="text-center p-10">
              <CardContent className="pt-6">
                <TreePine className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun arbre encore créé</h3>
                <p className="text-muted-foreground mb-6">
                  Commencez par créer votre premier arbre généalogique pour préserver l'histoire de votre famille.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  Créer mon premier arbre
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trees.map((tree) => (
                <Card key={tree.id} className="overflow-hidden">
                  <CardHeader className="bg-family-navy text-white">
                    <CardTitle>{tree.name}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {tree.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="text-sm">0 membres</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Créé le {new Date(tree.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <Tabs defaultValue="view" className="w-full">
                      <TabsList className="w-full grid grid-cols-2 mb-4">
                        <TabsTrigger value="view">Visualiser</TabsTrigger>
                        <TabsTrigger value="manage">Gérer</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="view">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Visualisez et modifiez l'arbre généalogique de votre famille.
                          </p>
                          <div className="flex justify-between">
                            <Button variant="outline" onClick={() => openTreeEditor(tree.id)}>
                              <GitGraph className="mr-2 h-4 w-4" />
                              Visualiser l'arbre
                            </Button>
                            <Button onClick={() => openTreeEditor(tree.id)}>
                              Modifier l'arbre
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="manage">
                        <div className="space-y-4">
                          <div className="flex justify-between mb-4">
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedTree(tree.id === selectedTree ? null : tree.id)}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Gérer les accès
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleDeleteTree(tree.id)}
                            >
                              Supprimer l'arbre
                            </Button>
                          </div>
                          
                          {selectedTree === tree.id && (
                            <TreePermissions treeId={tree.id} />
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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

export default TreeManagementPage;
