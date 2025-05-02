
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FamilyMemberData } from '@/models/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberRelationsProps {
  member: FamilyMemberData;
  allMembers: FamilyMemberData[];
  onSelectMember?: (member: FamilyMemberData) => void;
}

const MemberRelations: React.FC<MemberRelationsProps> = ({ member, allMembers, onSelectMember }) => {
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
  
  // Grouper les descendants par génération
  const descendantsByGeneration: Record<number, FamilyMemberData[]> = {};
  descendants.forEach(({ member: descendant, generation }) => {
    if (!descendantsByGeneration[generation]) {
      descendantsByGeneration[generation] = [];
    }
    descendantsByGeneration[generation].push(descendant);
  });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Relations familiales de {formatMemberName(member)}
          <Badge className="ml-2">{degree} générations</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {parents.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Parents</h3>
            <div className="space-y-1">
              {parents.map(parent => (
                <MemberItem key={parent.id} member={parent} />
              ))}
            </div>
          </div>
        )}
        
        {siblings.length > 0 && (
          <div>
            <Separator className="my-3" />
            <h3 className="text-sm font-semibold mb-2">Frères et sœurs</h3>
            <div className="space-y-1">
              {siblings.map(sibling => (
                <MemberItem key={sibling.id} member={sibling} />
              ))}
            </div>
          </div>
        )}
        
        {children.length > 0 && (
          <div>
            <Separator className="my-3" />
            <h3 className="text-sm font-semibold mb-2">Enfants</h3>
            <div className="space-y-1">
              {children.map(child => (
                <MemberItem key={child.id} member={child} />
              ))}
            </div>
          </div>
        )}
        
        {Object.keys(descendantsByGeneration).length > 1 && (
          <div>
            <Separator className="my-3" />
            <h3 className="text-sm font-semibold mb-2">Descendants</h3>
            <div className="space-y-3">
              {Object.entries(descendantsByGeneration)
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
        
        {parents.length === 0 && siblings.length === 0 && children.length === 0 && degree === 0 && (
          <p className="text-muted-foreground text-sm italic">
            Aucune relation familiale n'a été définie pour ce membre.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberRelations;
