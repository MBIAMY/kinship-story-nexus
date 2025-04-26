
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FamilyStory, FamilyMember, familyMembers } from '@/data/sampleData';

interface StoryCardProps {
  story: FamilyStory;
}

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const author = familyMembers.find(member => member.id === story.authorId);
  
  // Format date
  const formattedDate = new Date(story.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get related members
  const relatedMembers = familyMembers.filter(member => 
    story.relatedMemberIds.includes(member.id)
  );
  
  return (
    <Card className="story-card overflow-hidden">
      {story.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={story.imageUrl} 
            alt={story.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className={story.imageUrl ? "pt-4" : ""}>
        <CardTitle className="text-xl">{story.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <span>Partagé le {formattedDate}</span>
          {author && (
            <span className="flex items-center gap-1">
              par
              <Avatar className="h-5 w-5 ml-1">
                <AvatarImage src={author.imageUrl} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {author.name}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <p className="line-clamp-3 text-muted-foreground">
          {story.content}
        </p>
        
        {relatedMembers.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            <span className="text-sm text-muted-foreground mr-1">Concernant:</span>
            {relatedMembers.map(member => (
              <Badge key={member.id} variant="outline" className="bg-family-sand">
                {member.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full">Lire l'histoire complète</Button>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
