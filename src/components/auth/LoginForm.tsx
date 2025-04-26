
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Lock, User } from 'lucide-react';

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Configuration du formulaire
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Gestion de la soumission du formulaire
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Simule une connexion réussie (à remplacer par un appel à votre API Java Spring Boot)
      console.log('Tentative de connexion avec:', data);
      
      // Simulation d'une attente de réponse du serveur
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stocke les informations utilisateur dans le localStorage (à remplacer par une solution plus sécurisée)
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userId', '123'); // À remplacer par l'ID réel retourné par le backend
      
      toast.success('Connexion réussie!');
      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast.error('Échec de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="votre@email.com" 
                    className="pl-10" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10" 
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
