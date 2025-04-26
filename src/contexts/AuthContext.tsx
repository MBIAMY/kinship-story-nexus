
import React, { createContext, useContext, useState, useEffect } from 'react';

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
        
        if (userId && userEmail) {
          setUser({
            id: userId,
            email: userEmail,
          });
          setIsAuthenticated(true);
        }
      }
    };
    
    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    // À remplacer par un appel API réel à votre backend Java Spring Boot
    // Simulation d'une réponse de l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUserId = '123';
    
    // Stockage des infos utilisateur
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userId', mockUserId);
    localStorage.setItem('userEmail', email);
    
    setUser({
      id: mockUserId,
      email: email,
    });
    
    setIsAuthenticated(true);
  };

  // Fonction d'inscription
  const register = async (name: string, email: string, password: string) => {
    // À remplacer par un appel API réel à votre backend Java Spring Boot
    // Simulation d'une réponse de l'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dans un vrai système, l'inscription ne connecterait pas automatiquement l'utilisateur
    // Ce serait une étape séparée
    return;
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    
    setUser(null);
    setIsAuthenticated(false);
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
