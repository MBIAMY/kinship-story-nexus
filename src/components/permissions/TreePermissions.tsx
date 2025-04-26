
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

// Types pour les permissions
type Permission = 'view' | 'edit' | 'share' | 'delete';

type UserPermission = {
  userId: string;
  email: string;
  permissions: Record<Permission, boolean>;
};

// Schéma de validation pour l'ajout d'utilisateur
const addUserSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  canView: z.boolean().default(true),
  canEdit: z.boolean().default(false),
  canShare: z.boolean().default(false),
  canDelete: z.boolean().default(false),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

const TreePermissions = ({ treeId }: { treeId: string }) => {
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([
    {
      userId: '456',
      email: 'famille@exemple.com',
      permissions: {
        view: true,
        edit: true,
        share: false,
        delete: false
      }
    },
    {
      userId: '789',
      email: 'cousin@exemple.com',
      permissions: {
        view: true,
        edit: false,
        share: false,
        delete: false
      }
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Configuration du formulaire
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      email: '',
      canView: true,
      canEdit: false,
      canShare: false,
      canDelete: false,
    },
  });

  // Fonction pour ajouter un utilisateur avec des permissions
  const handleAddUser = (data: AddUserFormValues) => {
    // Dans une application réelle, ici vous feriez un appel à votre API Java Spring Boot
    
    // Simulation d'ajout d'un utilisateur
    const newUserPermission: UserPermission = {
      userId: `user-${Date.now()}`, // Générer un ID temporaire
      email: data.email,
      permissions: {
        view: data.canView,
        edit: data.canEdit,
        share: data.canShare,
        delete: data.canDelete
      }
    };
    
    setUserPermissions([...userPermissions, newUserPermission]);
    form.reset();
    setIsDialogOpen(false);
    toast.success(`L'accès a été accordé à ${data.email}`);
  };

  // Fonction pour mettre à jour les permissions d'un utilisateur
  const updatePermission = (userId: string, permission: Permission, value: boolean) => {
    setUserPermissions(userPermissions.map(user => 
      user.userId === userId 
        ? { ...user, permissions: { ...user.permissions, [permission]: value } }
        : user
    ));
    
    // Dans une application réelle, ici vous feriez un appel à votre API Java Spring Boot
    toast.success(`Permissions mises à jour`);
  };

  // Fonction pour supprimer l'accès d'un utilisateur
  const removeUserAccess = (userId: string) => {
    const userToRemove = userPermissions.find(u => u.userId === userId);
    setUserPermissions(userPermissions.filter(user => user.userId !== userId));
    
    // Dans une application réelle, ici vous feriez un appel à votre API Java Spring Boot
    if (userToRemove) {
      toast.success(`L'accès pour ${userToRemove.email} a été révoqué`);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des autorisations</CardTitle>
          <CardDescription>Définir qui peut accéder et modifier votre arbre généalogique</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un membre
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accorder l'accès à un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Entrez l'adresse email et définissez les autorisations pour cet utilisateur.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemple.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        L'utilisateur recevra une invitation par email.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="canView"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Peut visualiser l'arbre</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="canEdit"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Peut modifier l'arbre</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="canShare"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Peut partager l'arbre</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="canDelete"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Peut supprimer l'arbre</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit">Ajouter l'utilisateur</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left">Utilisateur</th>
                  <th className="py-3 px-4 text-center">Voir</th>
                  <th className="py-3 px-4 text-center">Modifier</th>
                  <th className="py-3 px-4 text-center">Partager</th>
                  <th className="py-3 px-4 text-center">Supprimer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPermissions.map((user) => (
                  <tr key={user.userId} className="border-b">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {user.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox 
                        checked={user.permissions.view}
                        onCheckedChange={(value) => updatePermission(user.userId, 'view', !!value)}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox 
                        checked={user.permissions.edit}
                        onCheckedChange={(value) => updatePermission(user.userId, 'edit', !!value)}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox 
                        checked={user.permissions.share}
                        onCheckedChange={(value) => updatePermission(user.userId, 'share', !!value)}
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Checkbox 
                        checked={user.permissions.delete}
                        onCheckedChange={(value) => updatePermission(user.userId, 'delete', !!value)}
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeUserAccess(user.userId)}
                      >
                        Révoquer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              Les utilisateurs avec permission de "partage" peuvent ajouter d'autres membres.
              La permission de "suppression" permet de supprimer complètement l'arbre.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreePermissions;
