
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FamilyMemberData, FamilyTreeData } from '@/models/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { GitGraph, User, UserPlus, Edit, Trash2, X } from 'lucide-react';
import TreePermissions from '@/components/permissions/TreePermissions';
import AddMemberForm from '@/components/tree/AddMemberForm';
import FamilyGraph from '@/components/FamilyGraph';
import EditMemberForm from '@/components/tree/EditMemberForm';
import MemberRelations from '@/components/tree/MemberRelations';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const TreeViewPage = () => {
  const { treeId } = useParams<{ treeId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [tree, setTree] = useState<FamilyTreeData | null>(null);
  const [members, setMembers] = useState<FamilyMemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberData | null>(null);
  const [showEditMember, setShowEditMember] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRelations, setShowRelations] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    const fetchTreeData = async () => {
      if (!treeId) return;
      
      setIsLoading(true);
      
      try {
        const treeData: FamilyTreeData = {
          id: treeId,
          name: "Famille Dupont",
          description: "L'arbre généalogique de la famille Dupont depuis 1920",
          ownerId: "123",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const membersData: FamilyMemberData[] = [
          {
            id: "member-1",
            treeId: treeId,
            firstName: "Jean",
            lastName: "Dupont",
            birthDate: "1920-05-15",
            gender: "M",
            birthPlace: "Paris",
            createdBy: "123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "member-2",
            treeId: treeId,
            firstName: "Marie",
            lastName: "Dupont",
            birthDate: "1925-11-22",
            gender: "F",
            birthPlace: "Lyon",
            parentId1: "member-1", // Marie est la fille de Jean
            createdBy: "123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "member-3",
            treeId: treeId,
            firstName: "Pierre",
            lastName: "Dupont",
            birthDate: "1945-03-10",
            gender: "M",
            birthPlace: "Paris",
            parentId1: "member-2", // Pierre est le fils de Marie
            createdBy: "123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "member-4",
            treeId: treeId,
            firstName: "Sophie",
            lastName: "Dupont",
            birthDate: "1948-07-24",
            gender: "F",
            birthPlace: "Paris",
            parentId1: "member-2", // Sophie est la fille de Marie (soeur de Pierre)
            createdBy: "123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "member-5",
            treeId: treeId,
            firstName: "Luc",
            lastName: "Dupont",
            birthDate: "1970-12-05",
            gender: "M",
            birthPlace: "Marseille",
            parentId1: "member-3", // Luc est le fils de Pierre
            createdBy: "123",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        setTree(treeData);
        setMembers(membersData);
        
        setCanEdit(treeData.ownerId === user?.id);
        
      } catch (error) {
        console.error('Erreur lors du chargement de l\'arbre', error);
        toast.error('Erreur lors du chargement de l\'arbre');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTreeData();
  }, [treeId, user?.id]);
  
  const handleAddMember = (newMember: FamilyMemberData) => {
    setMembers([...members, newMember]);
  };
  
  const handleEditMember = (updatedMember: FamilyMemberData) => {
    const updatedMembers = members.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    );
    setMembers(updatedMembers);
  };
  
  const handleDeleteMember = () => {
    if (!selectedMember) return;
    
    const updatedMembers = members.filter(member => member.id !== selectedMember.id);
    setMembers(updatedMembers);
    toast.success(`${selectedMember.firstName} ${selectedMember.lastName} a été supprimé`);
    setShowDeleteDialog(false);
    setSelectedMember(null);
    setShowRelations(false);
  };
  
  const handleMemberSelection = (member: FamilyMemberData) => {
    setSelectedMember(member);
    setShowRelations(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-family-cream/30">
        <Header />
        <main className="flex-1 container mx-auto p-6 flex items-center justify-center">
          <p>Chargement de l'arbre généalogique...</p>
        </main>
      </div>
    );
  }
  
  if (!tree) {
    return (
      <div className="min-h-screen flex flex-col bg-family-cream/30">
        <Header />
        <main className="flex-1 container mx-auto p-6 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Arbre introuvable</CardTitle>
              <CardDescription>
                L'arbre généalogique que vous recherchez n'existe pas ou vous n'avez pas les permissions pour y accéder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/arbres')}>
                Retourner à mes arbres
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-family-cream/30">
      <Header />
      
      <main className="flex-1 container mx-auto p-6">
        <div className="max-w-5xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-family-navy">
                {tree.name}
              </h1>
              {tree.description && (
                <p className="text-muted-foreground">
                  {tree.description}
                </p>
              )}
            </div>
            
            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPermissions(!showPermissions)}
                >
                  Gérer les accès
                </Button>
                <Button onClick={() => setShowAddMember(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter un membre
                </Button>
              </div>
            )}
          </div>
          
          <Tabs defaultValue="tree" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="tree">Arbre généalogique</TabsTrigger>
              <TabsTrigger value="members">Membres ({members.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tree" className="relative">
              <Card className="p-6">
                <FamilyGraph 
                  members={members} 
                  onSelectMember={handleMemberSelection} 
                />
              </Card>
              
              {showRelations && selectedMember && (
                <div className="mt-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold">
                      Relations familiales
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowRelations(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <MemberRelations 
                    member={selectedMember} 
                    allMembers={members} 
                    onSelectMember={handleMemberSelection}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Membres de la famille</CardTitle>
                  <CardDescription>
                    Liste de tous les membres ajoutés à cet arbre
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="text-center p-6">
                      <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Aucun membre</h3>
                      <p className="text-muted-foreground mb-6">
                        Cet arbre généalogique ne contient pas encore de membres.
                      </p>
                      {canEdit && (
                        <Button onClick={() => setShowAddMember(true)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Ajouter le premier membre
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-3 px-4 text-left">Nom</th>
                            <th className="py-3 px-4 text-left">Genre</th>
                            <th className="py-3 px-4 text-left">Date de naissance</th>
                            <th className="py-3 px-4 text-left">Lieu de naissance</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {members.map((member) => (
                            <tr key={member.id} className="border-b">
                              <td className="py-3 px-4">
                                {member.firstName} {member.lastName}
                              </td>
                              <td className="py-3 px-4">
                                {member.gender === 'M' && 'Homme'}
                                {member.gender === 'F' && 'Femme'}
                                {member.gender === 'O' && 'Autre'}
                                {!member.gender && '-'}
                              </td>
                              <td className="py-3 px-4">
                                {member.birthDate ? new Date(member.birthDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="py-3 px-4">
                                {member.birthPlace || '-'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMemberSelection(member)}
                                  >
                                    <GitGraph className="h-4 w-4" />
                                  </Button>
                                  {canEdit && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedMember(member);
                                          setShowEditMember(true);
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedMember(member);
                                          setShowDeleteDialog(true);
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {showRelations && selectedMember && (
                <div className="mt-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Relations familiales</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowRelations(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <MemberRelations 
                        member={selectedMember} 
                        allMembers={members} 
                        onSelectMember={handleMemberSelection}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {showPermissions && canEdit && (
            <div className="mt-6">
              <TreePermissions treeId={tree.id} />
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-family-navy text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            Nexus Familial - Préservez et partagez l'héritage de votre famille
          </p>
        </div>
      </footer>
      
      <AddMemberForm 
        treeId={tree.id}
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAddMember={handleAddMember}
        existingMembers={members}
      />
      
      {selectedMember && (
        <EditMemberForm
          member={selectedMember}
          isOpen={showEditMember}
          onClose={() => {
            setShowEditMember(false);
            setSelectedMember(null);
          }}
          onEdit={handleEditMember}
        />
      )}
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le membre sera définitivement supprimé de l'arbre généalogique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TreeViewPage;
