
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FamilyMemberData } from '@/models/types';

interface FamilyGraphProps {
  members?: FamilyMemberData[];
}

const FamilyGraph: React.FC<FamilyGraphProps> = ({ members = [] }) => {
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

      // Prepare data for D3
      const formatData = () => {
        const nodes = members.map(member => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          parentId1: member.parentId1 || '',
          parentId2: member.parentId2 || '',
          gender: member.gender || ''
        }));

        const links: { source: string; target: string; }[] = [];
        
        // Create links between parents and children
        nodes.forEach(node => {
          if (node.parentId1 && node.parentId1 !== 'none') {
            links.push({ source: node.parentId1, target: node.id });
          }
          if (node.parentId2 && node.parentId2 !== 'none') {
            links.push({ source: node.parentId2, target: node.id });
          }
        });

        return { nodes, links };
      };

      const graphData = formatData();

      // Vérifier que tous les IDs sources dans les liens existent dans les nœuds
      const validLinks = graphData.links.filter(link => {
        const sourceExists = graphData.nodes.some(node => node.id === link.source);
        if (!sourceExists) {
          console.warn(`Lien ignoré: Source ID ${link.source} n'existe pas dans les nœuds`);
        }
        return sourceExists;
      });

      // Create force simulation
      const simulation = d3.forceSimulation(graphData.nodes as any)
        .force("link", d3.forceLink(validLinks).id((d: any) => d.id).distance(100))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(60));

      // Create links
      const links = g.append("g")
        .selectAll("line")
        .data(validLinks)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("stroke", "#8E9196")
        .attr("stroke-width", 1.5);

      // Create node container groups
      const nodes = g.append("g")
        .selectAll(".node")
        .data(graphData.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any);

      // Add circles to nodes with gender-based colors
      nodes.append("circle")
        .attr("r", 30)
        .attr("fill", (d: any) => {
          switch(d.gender) {
            case 'M': return "#3b82f6"; // Bleu pour les hommes
            case 'F': return "#ec4899"; // Rose pour les femmes
            default: return "#1A1F2C";  // Couleur par défaut
          }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

      // Add names to nodes
      nodes.append("text")
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .text((d: any) => d.name)
        .attr("class", "font-medium text-sm");

      // Update positions on each tick
      simulation.on("tick", () => {
        links
          .attr("d", (d: any) => {
            const sourceX = d.source.x;
            const sourceY = d.source.y;
            const targetX = d.target.x;
            const targetY = d.target.y;
            
            return `M${sourceX},${sourceY}L${targetX},${targetY}`;
          });

        nodes
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });

      // Drag functions
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
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

    // Handle window resize avec debounce pour éviter les problèmes de performance
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      
      resizeTimer = window.setTimeout(() => {
        if (svgRef.current && containerRef.current) {
          // Plutôt que de recharger toute la page, déclenchons simplement un re-rendu
          d3.select(svgRef.current).selectAll("*").remove();
          
          // Forcer un re-rendu complet au lieu d'essayer de mettre à jour partiellement
          const newWidth = containerRef.current.clientWidth;
          d3.select(svgRef.current)
            .attr("width", newWidth);
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      // Nettoyer les écouteurs d'événements pour éviter les fuites de mémoire
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
    };
  }, [members]);

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
