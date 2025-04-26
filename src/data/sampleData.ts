
export interface FamilyMember {
  id: string;
  name: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  imageUrl?: string;
  parentIds: string[];
  bio?: string;
}

export interface FamilyStory {
  id: string;
  title: string;
  content: string;
  authorId: string;
  date: string;
  relatedMemberIds: string[];
  imageUrl?: string;
}

export const familyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Marie Dupont",
    dateOfBirth: "1935-05-15",
    imageUrl: "https://images.unsplash.com/photo-1581579186913-45ac9e4cdb94",
    parentIds: [],
    bio: "Fondatrice de notre lignée, Marie a survécu à la Seconde Guerre mondiale et a élevé seule 3 enfants."
  },
  {
    id: "2",
    name: "Jean Dupont",
    dateOfBirth: "1955-08-22",
    imageUrl: "https://images.unsplash.com/photo-1552058544-f2b08422138a",
    parentIds: ["1"],
    bio: "Fils aîné de Marie, ingénieur qui a travaillé sur les premiers systèmes informatiques en France."
  },
  {
    id: "3",
    name: "Sophie Martin",
    dateOfBirth: "1958-03-10",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    parentIds: ["1"],
    bio: "Fille de Marie, professeur d'histoire à l'université de Lyon pendant plus de 30 ans."
  },
  {
    id: "4",
    name: "Pierre Dupont",
    dateOfBirth: "1962-11-30",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    parentIds: ["1"],
    bio: "Le plus jeune enfant de Marie, a voyagé dans le monde entier en tant que journaliste."
  },
  {
    id: "5",
    name: "Claire Dubois",
    dateOfBirth: "1980-02-14",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    parentIds: ["2"],
    bio: "Fille de Jean, médecin spécialisée en pédiatrie et volontaire dans des missions humanitaires."
  },
  {
    id: "6",
    name: "Thomas Martin",
    dateOfBirth: "1982-07-08",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    parentIds: ["3"],
    bio: "Fils de Sophie, artiste et musicien reconnu dans la scène alternative parisienne."
  },
  {
    id: "7",
    name: "Emma Dupont",
    dateOfBirth: "1985-12-03",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
    parentIds: ["4"],
    bio: "Fille de Pierre, auteure et journaliste suivant les traces de son père."
  },
  {
    id: "8",
    name: "Lucas Dubois",
    dateOfBirth: "2010-09-27",
    imageUrl: "https://images.unsplash.com/photo-1595211877493-41a4e5f236b3",
    parentIds: ["5"],
    bio: "Fils de Claire, passionné par les sciences et la technologie."
  }
];

export const familyStories: FamilyStory[] = [
  {
    id: "1",
    title: "La recette du pain de Marie",
    content: "Notre grand-mère Marie nous a transmis cette recette de pain qui traverse les générations. Pendant la guerre, quand les ingrédients manquaient, elle utilisait...",
    authorId: "3",
    date: "2020-05-15",
    relatedMemberIds: ["1"],
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7b"
  },
  {
    id: "2",
    title: "Les lettres cachées",
    content: "En nettoyant le grenier de la maison familiale, j'ai trouvé une boîte contenant des lettres échangées entre grand-mère Marie et un certain François pendant la guerre...",
    authorId: "5",
    date: "2021-02-10",
    relatedMemberIds: ["1"]
  },
  {
    id: "3",
    title: "Le premier ordinateur",
    content: "Mon père Jean m'a souvent raconté comment il a travaillé sur l'un des premiers ordinateurs en France dans les années 70. À l'époque, la machine occupait une pièce entière...",
    authorId: "5",
    date: "2019-08-22",
    relatedMemberIds: ["2"],
    imageUrl: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d"
  },
  {
    id: "4",
    title: "Voyage au Maroc en 1990",
    content: "Quand j'avais 8 ans, mon père Pierre m'a emmené au Maroc pour un reportage. Je me souviens encore des couleurs vibrantes des souks de Marrakech...",
    authorId: "7",
    date: "2018-06-15",
    relatedMemberIds: ["4", "7"],
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada"
  }
];

// Format data for D3.js force-directed graph
export const formatFamilyDataForGraph = () => {
  const nodes = familyMembers.map(member => ({
    id: member.id,
    name: member.name,
    img: member.imageUrl || "",
  }));
  
  // Create links from parent-child relationships
  let links: {source: string, target: string}[] = [];
  
  familyMembers.forEach(member => {
    member.parentIds.forEach(parentId => {
      links.push({
        source: parentId,
        target: member.id
      });
    });
  });
  
  return { nodes, links };
};
