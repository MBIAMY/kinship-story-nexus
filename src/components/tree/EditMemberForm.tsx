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

const memberSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est obligatoire'),
  lastName: z.string().min(1, 'Le nom est obligatoire'),
  gender: z.enum(['M', 'F']).optional(),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  deathDate: z.string().optional(),
  bio: z.string().optional(),
});

type EditMemberFormProps = {
  member: FamilyMemberData;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: FamilyMemberData) => void;
};

const EditMemberForm = ({ member, isOpen, onClose, onEdit }: EditMemberFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: member.firstName,
      lastName: member.lastName,
      gender: member.gender,
      birthDate: member.birthDate,
      birthPlace: member.birthPlace,
      deathDate: member.deathDate,
      bio: member.bio || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setDialogOpen(true);
      form.reset({
        firstName: member.firstName,
        lastName: member.lastName,
        gender: member.gender,
        birthDate: member.birthDate,
        birthPlace: member.birthPlace,
        deathDate: member.deathDate,
        bio: member.bio || '',
      });
    }
  }, [isOpen, form, member]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (isLoading) return;
      
      setDialogOpen(false);
      
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  const onSubmit = async (data: z.infer<typeof memberSchema>) => {
    setIsLoading(true);
    
    try {
      const updatedMember: FamilyMemberData = {
        ...member,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDialogOpen(false);
      
      setTimeout(() => {
        onEdit(updatedMember);
        toast.success(`${data.firstName} ${data.lastName} a été modifié`);
        onClose();
      }, 100);
    } catch (error) {
      console.error('Erreur lors de la modification du membre', error);
      toast.error('Échec de la modification du membre');
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
                <FormLabel>Date de décès</FormLabel>
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
              {isLoading ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </Button>
          </DrawerFooter>
        ) : (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Modification en cours...' : 'Enregistrer les modifications'}
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
            <DrawerTitle>Modifier le membre</DrawerTitle>
            <DrawerDescription>
              Modifiez les informations du membre de votre famille.
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
          <DialogTitle>Modifier le membre</DialogTitle>
          <DialogDescription>
            Modifiez les informations du membre de votre famille.
          </DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
};

export default EditMemberForm;
