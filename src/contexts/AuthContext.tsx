
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Vérification de l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      if (isAuth) {
        const userId = localStorage.getItem('userId');
        const userEmail = localStorage.getItem('userEmail');
        const userName = localStorage.getItem('userName');
        
        if (userId && userEmail) {
          setUser({
            id: userId,
            email: userEmail,
            name: userName || undefined,
          });
          setIsAuthenticated(true);
        }
      }
    };
    
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      // À remplacer par un appel API réel à votre backend Java Spring Boot
      // Simulation d'une réponse de l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUserId = '123';
      const mockUserName = 'Utilisateur';
      
      // Stockage des infos utilisateur
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', mockUserId);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', mockUserName);
      
      setUser({
        id: mockUserId,
        email: email,
        name: mockUserName,
      });
      
      setIsAuthenticated(true);
      toast.success('Connexion réussie!');
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      toast.error('Échec de la connexion');
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (name: string, email: string, password: string) => {
    try {
      // À remplacer par un appel API réel à votre backend Java Spring Boot
      // Simulation d'une réponse de l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Tentative d\'inscription avec:', { name, email, password });
      
      toast.success('Inscription réussie! Vous pouvez maintenant vous connecter.');
      // Dans un système réel, retourne la réponse de l'API
      return;
    } catch (error) {
      console.error('Erreur lors de l\'inscription', error);
      toast.error('Échec de l\'inscription');
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Vous avez été déconnecté');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
