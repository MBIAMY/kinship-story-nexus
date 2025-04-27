
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FamilyMemberData } from '@/models/types';

interface FamilyGraphProps {
  members: FamilyMemberData[];
}

const FamilyGraph: React.FC<FamilyGraphProps> = ({ members }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || members.length === 0) return;

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

    // Prepare data for D3
    const formatData = () => {
      const nodes = members.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        parentId1: member.parentId1 || '',
        parentId2: member.parentId2 || '',
      }));

      const links: { source: string; target: string; }[] = [];
      
      // Create links between parents and children
      nodes.forEach(node => {
        if (node.parentId1) {
          links.push({ source: node.parentId1, target: node.id });
        }
        if (node.parentId2) {
          links.push({ source: node.parentId2, target: node.id });
        }
      });

      return { nodes, links };
    };

    const graphData = formatData();

    // Create force simulation
    const simulation = d3.forceSimulation(graphData.nodes as any)
      .force("link", d3.forceLink(graphData.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(60));

    // Create links
    const links = g.append("g")
      .selectAll("line")
      .data(graphData.links)
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

    // Add circles to nodes
    nodes.append("circle")
      .attr("r", 30)
      .attr("fill", "#1A1F2C")
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

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      svg.attr("width", newWidth);
      simulation.force("center", d3.forceCenter(newWidth / 2, height / 2));
      simulation.alpha(0.3).restart();
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
