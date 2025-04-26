
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FamilyMember from './FamilyMember';
import StoryCard from './StoryCard';
import { familyMembers, familyStories } from '@/data/sampleData';

const ProfileSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Membres de la famille</CardTitle>
          <CardDescription>
            Découvrez tous les membres de votre famille et leurs histoires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="membres" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="membres">Membres</TabsTrigger>
              <TabsTrigger value="histoires">Histoires</TabsTrigger>
            </TabsList>
            
            <TabsContent value="membres" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {familyMembers.map(member => (
                  <FamilyMember key={member.id} member={member} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="histoires" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {familyStories.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
