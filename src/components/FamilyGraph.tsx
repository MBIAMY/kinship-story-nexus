
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FamilyMemberData } from '@/models/types';

interface FamilyGraphProps {
  members?: FamilyMemberData[];
}

const FamilyGraph: React.FC<FamilyGraphProps> = ({ members = [] }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

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

    try {
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
      
      // Afficher un message d'erreur au lieu d'une page blanche
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("class", "text-lg font-medium text-destructive")
        .text("Erreur lors de l'affichage de l'arbre généalogique");
    }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      // Au lieu de recharger la page, on recalcule simplement la taille
      try {
        const newWidth = containerRef.current.clientWidth;
        svg.attr("width", newWidth);
        // On utiliserait idéalement un état React pour déclencher un rendu,
        // mais pour simplifier, on efface et redessine
        setTimeout(() => {
          if (containerRef.current && svgRef.current) {
            d3.select(svgRef.current).selectAll("*").remove();
            // Nous aurions besoin de réinitialiser les écouteurs d'événements ici
          }
        }, 100);
      } catch (err) {
        console.error("Erreur lors du redimensionnement:", err);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [members]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full min-h-[600px] bg-white rounded-lg shadow-sm border overflow-hidden"
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default FamilyGraph;
