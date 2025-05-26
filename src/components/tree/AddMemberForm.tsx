import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { FamilyMemberData } from '@/models/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';

// Schéma de validation pour un nouveau membre de famille
const memberSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire'),
  lastName: z.string().min(1, 'Le nom est obligatoire'),
  gender: z.enum(['M', 'F']).optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  deathDate: z.string().optional(),
  bio: z.string().optional(),
  parentId1: z.string().optional(),
  parentId2: z.string().optional(),
  spouseId: z.string().optional(),
  cousinId: z.string().optional(),
}).refine((data) => {
  // Si pas de parents, alors conjoint OU cousin obligatoire
  if (!data.parentId1 && !data.parentId2) {
    return data.spouseId || data.cousinId;
  }
  return true;
}, {
  message: "Si aucun parent n'est sélectionné, vous devez choisir soit un conjoint soit un cousin",
  path: ["spouseId"]
});

type AddMemberFormProps = {
  treeId: string;
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (member: FamilyMemberData) => void;
  existingMembers: FamilyMemberData[];
};

// Fonction pour calculer la génération d'un membre
const calculateGeneration = (memberId: string, allMembers: FamilyMemberData[]): number => {
  const member = allMembers.find(m => m.id === memberId);
  if (!member) return 0;
  
  if (!member.parentId1 && !member.parentId2) {
    return 0; // Génération racine
  }
  
  const parent1Gen = member.parentId1 ? calculateGeneration(member.parentId1, allMembers) : -1;
  const parent2Gen = member.parentId2 ? calculateGeneration(member.parentId2, allMembers) : -1;
  
  return Math.max(parent1Gen, parent2Gen) + 1;
};

const AddMemberForm = ({ treeId, isOpen, onClose, onAddMember, existingMembers }: AddMemberFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Configuration du formulaire
  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: undefined,
      birthDate: '',
      birthPlace: '',
      deathDate: '',
      bio: '',
      parentId1: '',
      parentId2: '',
      spouseId: '',
      cousinId: '',
    },
  });
  
  // Surveiller les changements des champs parents
  const watchParentId1 = form.watch('parentId1');
  const watchParentId2 = form.watch('parentId2');
  const hasParents = (watchParentId1 && watchParentId1 !== 'none') || (watchParentId2 && watchParentId2 !== 'none');
  
  // Synchroniser l'état local du dialogue avec la prop isOpen
  useEffect(() => {
    if (isOpen) {
      setDialogOpen(true);
      // Réinitialiser le formulaire à l'ouverture
      form.reset();
    }
  }, [isOpen, form]);

  // Calculer la génération de la personne en cours d'ajout
  const getCurrentPersonGeneration = () => {
    if (hasParents) {
      // Si a des parents, la génération est celle du parent + 1
      const parentId = watchParentId1 && watchParentId1 !== 'none' ? watchParentId1 : watchParentId2;
      if (parentId && parentId !== 'none') {
        const parentGen = calculateGeneration(parentId, existingMembers);
        return parentGen + 1;
      }
    }
    // Si pas de parents, génération 0 (racine)
    return 0;
  };

  // Calculer les membres disponibles pour conjoint (même génération)
  const getAvailableSpouses = () => {
    const currentGeneration = getCurrentPersonGeneration();
    
    return existingMembers.filter(member => {
      const memberGeneration = calculateGeneration(member.id, existingMembers);
      return memberGeneration === currentGeneration;
    });
  };

  // Calculer les membres disponibles pour cousin (même génération)
  const getAvailableCousins = () => {
    const currentGeneration = getCurrentPersonGeneration();
    
    return existingMembers.filter(member => {
      const memberGeneration = calculateGeneration(member.id, existingMembers);
      
      // Même génération
      if (memberGeneration !== currentGeneration) {
        return false;
      }
      
      // Si la personne a des parents, éviter les frères et sœurs directs
      if (hasParents) {
        const parentId1 = watchParentId1 && watchParentId1 !== 'none' ? watchParentId1 : undefined;
        const parentId2 = watchParentId2 && watchParentId2 !== 'none' ? watchParentId2 : undefined;
        
        // Exclure les membres qui ont les mêmes parents (frères/sœurs)
        const memberParent1 = member.parentId1;
        const memberParent2 = member.parentId2;
        
        const isSibling = (parentId1 && (memberParent1 === parentId1 || memberParent2 === parentId1)) ||
                         (parentId2 && (memberParent1 === parentId2 || memberParent2 === parentId2));
        
        return !isSibling;
      }
      
      return true;
    });
  };

  // Gérer la fermeture du dialogue de manière sécurisée
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isLoading) return; // Ne pas fermer pendant le chargement
      
      // Mettre à jour l'état local immédiatement
      setDialogOpen(false);
      
      // Différer l'appel à onClose pour éviter les problèmes de suppression de nœuds
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  // Gestion de la soumission
  const onSubmit = async (data: z.infer<typeof memberSchema>) => {
    setIsLoading(true);
    
    try {
      // Dans une application réelle, ceci serait un appel à l'API
      const newMember: FamilyMemberData = {
        id: `member-${Date.now()}`,
        treeId: treeId,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        deathDate: data.deathDate,
        bio: data.bio,
        parentId1: data.parentId1 && data.parentId1 !== 'none' ? data.parentId1 : undefined,
        parentId2: data.parentId2 && data.parentId2 !== 'none' ? data.parentId2 : undefined,
        createdBy: localStorage.getItem('userId') || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulation d'un délai d'appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour l'état local avant de fermer le dialogue
      setDialogOpen(false);
      
      // Différer les actions suivantes pour éviter les problèmes de cycle de vie
      setTimeout(() => {
        onAddMember(newMember);
        
        let relationMessage = '';
        if (data.spouseId && data.spouseId !== 'none') {
          const spouse = existingMembers.find(m => m.id === data.spouseId);
          relationMessage = ` comme conjoint de ${spouse?.firstName} ${spouse?.lastName}`;
        } else if (data.cousinId && data.cousinId !== 'none') {
          const cousin = existingMembers.find(m => m.id === data.cousinId);
          relationMessage = ` comme cousin de ${cousin?.firstName} ${cousin?.lastName}`;
        }
        
        toast.success(`${data.firstName} ${data.lastName} a été ajouté à l'arbre${relationMessage}`);
        form.reset();
        onClose();
      }, 100);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre', error);
      toast.error('Échec de l\'ajout du membre');
    } finally {
      setIsLoading(false);
    }
  };

  const FormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un genre" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="M">Homme</SelectItem>
                  <SelectItem value="F">Femme</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de naissance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="deathDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de décès (optionnel)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="birthPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu de naissance</FormLabel>
              <FormControl>
                <Input placeholder="Lieu de naissance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="parentId1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Premier parent</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un parent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="none">Aucun</SelectItem>
                    {existingMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="parentId2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deuxième parent</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un parent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="none">Aucun</SelectItem>
                    {existingMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!hasParents && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Sans parents, vous devez sélectionner soit un conjoint soit un cousin de la même génération :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="spouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conjoint (génération {getCurrentPersonGeneration()})</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un conjoint" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        <SelectItem value="none">Aucun</SelectItem>
                        {getAvailableSpouses().map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} (Gén. {calculateGeneration(member.id, existingMembers)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cousinId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cousin (génération {getCurrentPersonGeneration()})</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un cousin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        <SelectItem value="none">Aucun</SelectItem>
                        {getAvailableCousins().map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} (Gén. {calculateGeneration(member.id, existingMembers)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        
        {hasParents && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Relations optionnelles (même génération {getCurrentPersonGeneration()}) :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="spouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conjoint (optionnel)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un conjoint" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        <SelectItem value="none">Aucun</SelectItem>
                        {getAvailableSpouses().map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} (Gén. {calculateGeneration(member.id, existingMembers)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cousinId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cousin (optionnel)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un cousin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        <SelectItem value="none">Aucun</SelectItem>
                        {getAvailableCousins().map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} (Gén. {calculateGeneration(member.id, existingMembers)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biographie</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Quelques informations sur cette personne..." 
                  {...field} 
                  className="min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isMobile ? (
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Annuler
              </Button>
            </DrawerClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Ajout en cours...' : 'Ajouter le membre'}
            </Button>
          </DrawerFooter>
        ) : (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Ajout en cours...' : 'Ajouter le membre'}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={dialogOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="px-4 max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle>Ajouter un membre à l'arbre</DrawerTitle>
            <DrawerDescription>
              Entrez les informations du membre de votre famille.
            </DrawerDescription>
          </DrawerHeader>
          {FormContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un membre à l'arbre</DialogTitle>
          <DialogDescription>
            Entrez les informations du membre de votre famille.
          </DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberForm;
