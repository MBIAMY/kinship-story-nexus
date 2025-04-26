
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { familyMembers } from '@/data/sampleData';

const AddStoryForm = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Ajouter une nouvelle histoire</CardTitle>
        <CardDescription>
          Partagez vos souvenirs et anecdotes pour enrichir l'héritage familial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'histoire</Label>
            <Input id="title" placeholder="Un titre évocateur pour votre histoire" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Votre histoire</Label>
            <Textarea 
              id="content" 
              placeholder="Racontez votre histoire en détail..." 
              className="min-h-[200px]" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Auteur</Label>
            <Select>
              <SelectTrigger id="author">
                <SelectValue placeholder="Sélectionnez l'auteur" />
              </SelectTrigger>
              <SelectContent>
                {familyMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="related">Membres concernés</Label>
            <Select>
              <SelectTrigger id="related">
                <SelectValue placeholder="Qui concerne cette histoire ?" />
              </SelectTrigger>
              <SelectContent>
                {familyMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Vous pourrez en ajouter plusieurs après la création
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image (optionnelle)</Label>
            <Input id="image" type="file" className="cursor-pointer" />
            <p className="text-xs text-muted-foreground">
              Formats acceptés: JPG, PNG, GIF (max 5MB)
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Annuler</Button>
        <Button>Enregistrer l'histoire</Button>
      </CardFooter>
    </Card>
  );
};

export default AddStoryForm;
