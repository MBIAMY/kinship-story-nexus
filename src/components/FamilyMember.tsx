
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FamilyMember as FamilyMemberType, familyMembers } from '@/data/sampleData';

interface FamilyMemberProps {
  member: FamilyMemberType;
  compact?: boolean;
}

const FamilyMember: React.FC<FamilyMemberProps> = ({ member, compact = false }) => {
  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get parents
  const parents = member.parentIds.map(parentId => 
    familyMembers.find(m => m.id === parentId)
  ).filter(Boolean);
  
  // Get children
  const children = familyMembers.filter(m => 
    m.parentIds.includes(member.id)
  );
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-md hover:bg-family-sand/30 transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.imageUrl} />
          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-sm">{member.name}</h3>
          {member.dateOfBirth && (
            <p className="text-xs text-muted-foreground">
              {formatDate(member.dateOfBirth)}
              {member.dateOfDeath && ` - ${formatDate(member.dateOfDeath)}`}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-16 w-16">
          <AvatarImage src={member.imageUrl} />
          <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-medium">{member.name}</h3>
          {member.dateOfBirth && (
            <p className="text-sm text-muted-foreground">
              {formatDate(member.dateOfBirth)}
              {member.dateOfDeath && ` - ${formatDate(member.dateOfDeath)}`}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {member.bio && <p className="text-muted-foreground">{member.bio}</p>}
        
        <div className="space-y-2">
          {parents.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Parents</h4>
              <div className="space-y-1">
                {parents.map(parent => parent && (
                  <div key={parent.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={parent.imageUrl} />
                      <AvatarFallback>{parent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{parent.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {children.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Enfants</h4>
              <div className="space-y-1">
                {children.map(child => (
                  <div key={child.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={child.imageUrl} />
                      <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{child.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyMember;
