
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FamilyMemberData } from '@/models/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MemberRelationsProps {
  member: FamilyMemberData;
  allMembers: FamilyMemberData[];
  onSelectMember?: (member: FamilyMemberData) => void;
}

const MemberRelations: React.FC<MemberRelationsProps> = ({ member, allMembers, onSelectMember }) => {
  // État pour les filtres
  const [searchTerm, setSearchTerm] = React.useState("");
  const [algorithm, setAlgorithm] = React.useState("default");
  const [relationType, setRelationType] = React.useState("all");

  // Calculer les relations familiales
  const parents = allMembers.filter(m => 
    m.id === member.parentId1 || m.id === member.parentId2
  );
  
  const siblings = allMembers.filter(m => 
    (m.id !== member.id) && 
    ((m.parentId1 && (m.parentId1 === member.parentId1 || m.parentId1 === member.parentId2)) ||
     (m.parentId2 && (m.parentId2 === member.parentId1 || m.parentId2 === member.parentId2)))
  );
  
  const children = allMembers.filter(m => 
    m.parentId1 === member.id || m.parentId2 === member.id
  );
  
  // Fonction récursive pour trouver les descendants
  const findDescendants = (memberId: string, generation = 1): {member: FamilyMemberData, generation: number}[] => {
    const directChildren = allMembers.filter(m => 
      m.parentId1 === memberId || m.parentId2 === memberId
    );
    
    let descendants = directChildren.map(child => ({
      member: child,
      generation
    }));
    
    // Récursion pour trouver les descendants plus éloignés
    directChildren.forEach(child => {
      const childDescendants = findDescendants(child.id, generation + 1);
      descendants = [...descendants, ...childDescendants];
    });
    
    return descendants;
  };
  
  // Tous les descendants regroupés par génération
  const descendants = findDescendants(member.id);
  const maxGeneration = Math.max(...descendants.map(d => d.generation), 0);
  
  // Calculer le degré du membre (nombre de générations issues de lui)
  const degree = maxGeneration;
  
  // Formatage pour l'affichage
  const formatMemberName = (m: FamilyMemberData) => `${m.firstName} ${m.lastName}`;
  
  const handleMemberClick = (selectedMember: FamilyMemberData) => {
    if (onSelectMember) {
      onSelectMember(selectedMember);
    }
  };

  // Fonction pour filtrer les membres selon les critères
  const filterMembers = (members: FamilyMemberData[]): FamilyMemberData[] => {
    // Filtrer d'abord par terme de recherche
    let filtered = members;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.firstName.toLowerCase().includes(term) || 
        m.lastName.toLowerCase().includes(term) ||
        (m.birthPlace && m.birthPlace.toLowerCase().includes(term))
      );
    }
    
    // Appliquer des algorithmes de recherche avancés si sélectionnés
    // (Dans un cas réel, cela appellerait votre API backend)
    if (algorithm !== "default") {
      // Simulation d'appel aux algorithmes
      console.log(`Applying ${algorithm} algorithm for filtering`);
      // Dans un cas réel, on appellerait l'API avec l'algorithme choisi
    }

    return filtered;
  };
  
  // Appliquer les filtres aux différents groupes
  const filteredParents = filterMembers(parents);
  const filteredSiblings = filterMembers(siblings);
  const filteredChildren = filterMembers(children);
  
  // Filtrer les descendants par génération et terme de recherche
  const filteredDescendantsByGeneration: Record<number, FamilyMemberData[]> = {};
  descendants.forEach(({ member: descendant, generation }) => {
    // Appliquer le filtre de recherche aux descendants
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!descendant.firstName.toLowerCase().includes(term) && 
          !descendant.lastName.toLowerCase().includes(term) &&
          !(descendant.birthPlace && descendant.birthPlace.toLowerCase().includes(term))) {
        return; // Ne pas inclure ce descendant s'il ne correspond pas au terme de recherche
      }
    }
    
    if (!filteredDescendantsByGeneration[generation]) {
      filteredDescendantsByGeneration[generation] = [];
    }
    filteredDescendantsByGeneration[generation].push(descendant);
  });
  
  // Composant pour afficher un membre avec son avatar
  const MemberItem = ({ member }: { member: FamilyMemberData }) => (
    <div 
      className="flex items-center gap-3 p-2 rounded hover:bg-family-sand/20 cursor-pointer transition-colors"
      onClick={() => handleMemberClick(member)}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={member.avatar} />
        <AvatarFallback>
          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">
        {formatMemberName(member)}
      </span>
    </div>
  );
  
  // Déterminer quelles sections afficher en fonction du type de relation sélectionné
  const showParentsSection = relationType === "all" || relationType === "parents";
  const showSiblingsSection = relationType === "all" || relationType === "siblings";
  const showChildrenSection = relationType === "all" || relationType === "children";
  const showDescendantsSection = relationType === "all" || relationType === "descendants";
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Relations familiales de {formatMemberName(member)}
          <Badge className="ml-2">{degree} générations</Badge>
        </CardTitle>
        
        {/* Filtres */}
        <div className="space-y-3 mt-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un nom ou lieu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={relationType} onValueChange={setRelationType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Type de relation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les relations</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
                <SelectItem value="siblings">Frères et sœurs</SelectItem>
                <SelectItem value="children">Enfants</SelectItem>
                <SelectItem value="descendants">Descendants</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Algorithme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Algorithme par défaut</SelectItem>
                <SelectItem value="dijkstra">Dijkstra</SelectItem>
                <SelectItem value="bellman-ford">Bellman-Ford</SelectItem>
                <SelectItem value="prim">Prim</SelectItem>
                <SelectItem value="kruskal">Kruskal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {filteredParents.length > 0 && showParentsSection && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Parents</h3>
            <div className="space-y-1">
              {filteredParents.map(parent => (
                <MemberItem key={parent.id} member={parent} />
              ))}
            </div>
          </div>
        )}
        
        {filteredSiblings.length > 0 && showSiblingsSection && (
          <div>
            <Separator className="my-3" />
            <h3 className="text-sm font-semibold mb-2">Frères et sœurs</h3>
            <div className="space-y-1">
              {filteredSiblings.map(sibling => (
                <MemberItem key={sibling.id} member={sibling} />
              ))}
            </div>
          </div>
        )}
        
        {filteredChildren.length > 0 && showChildrenSection && (
          <div>
            <Separator className="my-3" />
            <h3 className="text-sm font-semibold mb-2">Enfants</h3>
            <div className="space-y-1">
              {filteredChildren.map(child => (
                <MemberItem key={child.id} member={child} />
              ))}
            </div>
          </div>
        )}
        
        {Object.keys(filteredDescendantsByGeneration).length > 1 && showDescendantsSection && (
          <div>
            <Separator className="my-3" />
            <h3 className="text-sm font-semibold mb-2">Descendants</h3>
            <div className="space-y-3">
              {Object.entries(filteredDescendantsByGeneration)
                .filter(([gen]) => Number(gen) > 1) // Ignorer les enfants directs (génération 1)
                .map(([generation, members]) => (
                  <div key={generation}>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Génération {generation}
                    </h4>
                    <div className="space-y-1">
                      {members.map(descendant => (
                        <MemberItem key={descendant.id} member={descendant} />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Message si aucune relation n'est affichée après filtrage */}
        {((showParentsSection && filteredParents.length === 0) &&
          (showSiblingsSection && filteredSiblings.length === 0) &&
          (showChildrenSection && filteredChildren.length === 0) &&
          (showDescendantsSection && Object.keys(filteredDescendantsByGeneration).length <= 1)) && (
          <p className="text-muted-foreground text-sm italic">
            {searchTerm ? "Aucun résultat ne correspond à votre recherche." : "Aucune relation familiale n'a été définie pour ce membre."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberRelations;
