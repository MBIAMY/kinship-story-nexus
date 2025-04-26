
// Types pour l'authentification
export type UserCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type UserData = {
  id: string;
  name: string;
  email: string;
};

// Types pour les arbres généalogiques
export type FamilyTreeData = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type FamilyMemberData = {
  id: string;
  treeId: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  gender?: 'M' | 'F' | 'O';
  birthPlace?: string;
  bio?: string;
  avatar?: string;
  parentId1?: string; // Premier parent
  parentId2?: string; // Deuxième parent
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type FamilyStoryData = {
  id: string;
  treeId: string;
  title: string;
  content: string;
  date?: string;
  location?: string;
  images?: string[];
  relatedMemberIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// Types pour les permissions
export type PermissionType = 'VIEW' | 'EDIT' | 'SHARE' | 'DELETE';

export type UserPermission = {
  id: string;
  treeId: string;
  userId: string;
  permissions: PermissionType[];
};

// Exemple de structure pour les appels API (à adapter selon votre backend)
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
