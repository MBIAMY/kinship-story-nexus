import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FamilyMemberData } from '@/models/types';

interface FamilyGraphProps {
  members?: FamilyMemberData[];
  onSelectMember?: (member: FamilyMemberData) => void;
}

const FamilyGraph: React.FC<FamilyGraphProps> = ({ members = [], onSelectMember }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Nettoyer l'état d'erreur à chaque rendu
    setError(null);
    
    try {
      const width = containerRef.current.clientWidth;
      const height = 600;

      // Clear any existing SVG content
      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("max-width", "100%")
        .style("height", "auto");

      // Create container group for zoom
      const g = svg.append("g");

      // Add zoom capability
      const zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom as any);

      // If there are no members, display a placeholder
      if (members.length === 0) {
        g.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("class", "text-lg font-medium text-muted-foreground")
          .text("Aucun membre à afficher dans l'arbre");

        return;
      }

      // Prepare data for hierarchical layout
      const formatHierarchicalData = () => {
        // Créer un dictionnaire pour accéder rapidement aux membres par ID
        const membersById: { [key: string]: any } = {};
        members.forEach(member => {
          membersById[member.id] = {
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            gender: member.gender || '',
            children: []
          };
        });

        // Identifier les membres sans parents (racines de l'arbre)
        const roots: string[] = [];
        members.forEach(member => {
          const hasValidParent1 = member.parentId1 && member.parentId1 !== 'none' && membersById[member.parentId1];
          const hasValidParent2 = member.parentId2 && member.parentId2 !== 'none' && membersById[member.parentId2];

          // Si le membre a au moins un parent valide, l'ajouter comme enfant à ce(s) parent(s)
          if (hasValidParent1) {
            membersById[member.parentId1].children.push(member.id);
          }
          if (hasValidParent2) {
            membersById[member.parentId2].children.push(member.id);
          }

          // Si le membre n'a pas de parents valides, c'est une racine
          if (!hasValidParent1 && !hasValidParent2) {
            roots.push(member.id);
          }
        });

        return { membersById, roots };
      };

      const { membersById, roots } = formatHierarchicalData();

      // Positionner les membres en fonction de leur niveau dans la hiérarchie
      // On utilise un algorithme simple basé sur la profondeur
      const positionMembers = () => {
        const levels: { [key: string]: number } = {}; // Niveau de chaque membre
        const positions: { [key: string]: { x: number, y: number } } = {}; // Position finale
        
        // Déterminer le niveau de chaque membre (profondeur dans l'arbre)
        const assignLevels = (id: string, level: number) => {
          if (!membersById[id]) return;
          
          // Si le membre a déjà un niveau assigné, prendre le plus proche de la racine
          if (levels[id] !== undefined) {
            levels[id] = Math.min(levels[id], level);
          } else {
            levels[id] = level;
          }
          
          // Assigner des niveaux aux enfants
          membersById[id].children.forEach((childId: string) => {
            assignLevels(childId, level + 1);
          });
        };

        // Commencer à assigner les niveaux depuis les racines
        roots.forEach(rootId => {
          assignLevels(rootId, 0);
        });

        // Déterminer le nombre maximum de membres par niveau
        const membersPerLevel: { [level: number]: number } = {};
        Object.entries(levels).forEach(([id, level]) => {
          membersPerLevel[level] = (membersPerLevel[level] || 0) + 1;
        });

        // Assigner les positions X en fonction du niveau et Y en fonction de la distribution
        Object.entries(levels).forEach(([id, level]) => {
          const levelY = level * 120 + 80;  // Espacement vertical entre les niveaux
          
          // Pour positionner horizontalement, on répartit équitablement les membres d'un niveau
          const memberCount = membersPerLevel[level];
          const memberIndex = membersById[id].xIndex || 0;
          
          // Si xIndex n'est pas défini, on le calcule
          if (membersById[id].xIndex === undefined) {
            // On compte combien de membres de ce niveau ont déjà été positionnés
            let currentIndex = 0;
            for (const mId in levels) {
              if (levels[mId] === level && mId < id) {
                currentIndex++;
              }
            }
            membersById[id].xIndex = currentIndex;
          }
          
          const spacing = width / (memberCount + 1);
          const posX = spacing * (membersById[id].xIndex + 1);
          
          positions[id] = { x: posX, y: levelY };
        });

        return positions;
      };

      const positions = positionMembers();

      // Créer les nœuds et les liens graphiques
      // Créer les liens
      const links = g.append("g")
        .selectAll("path")
        .data(generateLinks())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("stroke", "#8E9196")
        .attr("stroke-width", 1.5)
        .attr("d", (d: any) => {
          const sourceX = positions[d.source].x;
          const sourceY = positions[d.source].y;
          const targetX = positions[d.target].x;
          const targetY = positions[d.target].y;
          
          // Utiliser une courbe pour les liens parent-enfant
          return `M${sourceX},${sourceY} C${sourceX},${(sourceY + targetY) / 2} ${targetX},${(sourceY + targetY) / 2} ${targetX},${targetY}`;
        });

      // Créer les nœuds
      const nodes = g.append("g")
        .selectAll(".node")
        .data(Object.keys(positions))
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (id) => `translate(${positions[id].x},${positions[id].y})`)
        .style("cursor", "pointer")
        .on("click", (event, id) => {
          if (onSelectMember) {
            const selectedMember = members.find(m => m.id === id);
            if (selectedMember) {
              onSelectMember(selectedMember);
            }
          }
        })
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", (event, id) => {
            const dx = event.x - positions[id].x;
            const dy = event.y - positions[id].y;
            
            // Limiter le déplacement vertical pour maintenir la hiérarchie
            positions[id].x = event.x;
            
            // Mise à jour de la position du nœud
            d3.select(event.sourceEvent.target.closest('.node'))
              .attr("transform", `translate(${positions[id].x},${positions[id].y})`);
            
            // Mise à jour des liens
            links.attr("d", (d: any) => {
              const sourceX = positions[d.source].x;
              const sourceY = positions[d.source].y;
              const targetX = positions[d.target].x;
              const targetY = positions[d.target].y;
              
              return `M${sourceX},${sourceY} C${sourceX},${(sourceY + targetY) / 2} ${targetX},${(sourceY + targetY) / 2} ${targetX},${targetY}`;
            });
          })
          .on("end", dragended) as any);

      // Ajouter les cercles aux nœuds avec des couleurs basées sur le genre
      nodes.append("circle")
        .attr("r", 30)
        .attr("fill", (id: string) => {
          const gender = membersById[id]?.gender;
          switch(gender) {
            case 'M': return "#3b82f6"; // Bleu pour les hommes
            case 'F': return "#ec4899"; // Rose pour les femmes
            default: return "#1A1F2C";  // Couleur par défaut
          }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);
      
      // Ajouter les noms aux nœuds
      nodes.append("text")
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .text((id: string) => membersById[id]?.name || id)
        .attr("class", "font-medium text-sm");

      // Générer les liens entre parents et enfants
      function generateLinks() {
        const links: { source: string; target: string; }[] = [];
        
        members.forEach(member => {
          if (member.parentId1 && member.parentId1 !== 'none' && membersById[member.parentId1]) {
            links.push({ source: member.parentId1, target: member.id });
          }
          if (member.parentId2 && member.parentId2 !== 'none' && membersById[member.parentId2]) {
            links.push({ source: member.parentId2, target: member.id });
          }
        });
        
        return links;
      }

      // Fonctions de glisser-déposer
      function dragstarted(event: any) {
        // Lorsque le glissement commence
      }

      function dragended(event: any) {
        // Lorsque le glissement se termine
      }

    } catch (error) {
      console.error("Erreur lors du rendu du graphique:", error);
      setError("Une erreur s'est produite lors de l'affichage du graphique");
      
      // Afficher un message d'erreur au lieu d'une page blanche
      if (svgRef.current) {
        const width = containerRef.current?.clientWidth || 800;
        const height = 600;
        
        d3.select(svgRef.current).selectAll("*").remove();
        
        const svg = d3.select(svgRef.current)
          .attr("width", width)
          .attr("height", height);
        
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("class", "text-lg font-medium text-destructive")
          .text("Erreur lors de l'affichage de l'arbre généalogique");
      }
    }

    // Handle window resize with debounce for performance
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      
      resizeTimer = window.setTimeout(() => {
        if (svgRef.current && containerRef.current) {
          // Rather than reloading the page, trigger a re-render
          d3.select(svgRef.current).selectAll("*").remove();
          
          // Force a full re-render instead of trying to partially update
          const newWidth = containerRef.current.clientWidth;
          d3.select(svgRef.current)
            .attr("width", newWidth);
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      // Clean up event listeners to avoid memory leaks
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
    };
  }, [members, onSelectMember]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full min-h-[600px] bg-white rounded-lg shadow-sm border overflow-hidden"
    >
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <p className="text-destructive text-lg">{error}</p>
        </div>
      )}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default FamilyGraph;
