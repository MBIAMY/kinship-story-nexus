
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChartNetwork, GitGraph, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className="border-b border-border bg-white py-4 px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartNetwork size={28} className="text-family-blue" />
          <h1 className="text-2xl font-bold text-family-navy">Nexus Familial</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Button 
            variant={location.pathname === '/' ? "default" : "ghost"} 
            onClick={() => navigate('/')}
            className="font-medium"
          >
            <GitGraph className="mr-2 h-4 w-4" />
            Arbre Généalogique
          </Button>
          <Button 
            variant={location.pathname === '/histoires' ? "default" : "ghost"}
            onClick={() => navigate('/histoires')}
            className="font-medium"
          >
            <User className="mr-2 h-4 w-4" />
            Membres & Histoires
          </Button>
        </nav>
        
        <div className="flex gap-2">
          <Button variant="outline">Connexion</Button>
          <Button>Ajouter une histoire</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
