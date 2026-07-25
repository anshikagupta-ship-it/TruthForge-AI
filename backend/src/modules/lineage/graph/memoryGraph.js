/**
 * MemoryGraph Data Structure
 * In-memory adjacency list & node index graph representation
 */

import { GraphNodeModel } from '../models/graphNode.model.js';
import { GraphEdgeModel } from '../models/graphEdge.model.js';

export class MemoryGraph {
  constructor() {
    /** @type {Map<string, GraphNodeModel>} */
    this.nodes = new Map();
    /** @type {Map<string, GraphEdgeModel>} */
    this.edges = new Map();
    /** @type {Map<string, Set<string>>} Outgoing edge IDs per node ID */
    this.outgoing = new Map();
    /** @type {Map<string, Set<string>>} Incoming edge IDs per node ID */
    this.incoming = new Map();
  }

  /**
   * Add a node to the graph
   * @param {GraphNodeModel|Object} node
   * @returns {GraphNodeModel}
   */
  addNode(node) {
    const nodeModel = node instanceof GraphNodeModel ? node : new GraphNodeModel(node);
    if (!this.nodes.has(nodeModel.id)) {
      this.nodes.set(nodeModel.id, nodeModel);
      this.outgoing.set(nodeModel.id, new Set());
      this.incoming.set(nodeModel.id, new Set());
    }
    return this.nodes.get(nodeModel.id);
  }

  /**
   * Get a node by ID
   * @param {string} nodeId
   * @returns {GraphNodeModel|null}
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId) || null;
  }

  /**
   * Add a directed edge to the graph
   * @param {GraphEdgeModel|Object} edge
   * @returns {GraphEdgeModel}
   */
  addEdge(edge) {
    const edgeModel = edge instanceof GraphEdgeModel ? edge : new GraphEdgeModel(edge);

    // Auto-create endpoints if missing
    if (!this.nodes.has(edgeModel.sourceNodeId)) {
      throw new Error(`Cannot add edge: source node "${edgeModel.sourceNodeId}" does not exist in graph.`);
    }
    if (!this.nodes.has(edgeModel.targetNodeId)) {
      throw new Error(`Cannot add edge: target node "${edgeModel.targetNodeId}" does not exist in graph.`);
    }

    if (!this.edges.has(edgeModel.id)) {
      this.edges.set(edgeModel.id, edgeModel);
      this.outgoing.get(edgeModel.sourceNodeId).add(edgeModel.id);
      this.incoming.get(edgeModel.targetNodeId).add(edgeModel.id);
    }
    return this.edges.get(edgeModel.id);
  }

  /**
   * Get outgoing edges for a node
   * @param {string} nodeId
   * @returns {GraphEdgeModel[]}
   */
  getOutgoingEdges(nodeId) {
    const edgeIds = this.outgoing.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map((id) => this.edges.get(id));
  }

  /**
   * Get incoming edges for a node
   * @param {string} nodeId
   * @returns {GraphEdgeModel[]}
   */
  getIncomingEdges(nodeId) {
    const edgeIds = this.incoming.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map((id) => this.edges.get(id));
  }

  /**
   * Get all nodes as array
   * @returns {GraphNodeModel[]}
   */
  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges as array
   * @returns {GraphEdgeModel[]}
   */
  getAllEdges() {
    return Array.from(this.edges.values());
  }

  /**
   * Perform depth-first traversal to find all paths starting from startNodeId
   * @param {string} startNodeId
   * @returns {GraphNodeModel[]}
   */
  getReachableNodes(startNodeId) {
    const visited = new Set();
    const stack = [startNodeId];

    while (stack.length > 0) {
      const currentId = stack.pop();
      if (!visited.has(currentId)) {
        visited.add(currentId);
        const outgoingEdges = this.getOutgoingEdges(currentId);
        outgoingEdges.forEach((edge) => {
          if (!visited.has(edge.targetNodeId)) {
            stack.push(edge.targetNodeId);
          }
        });
      }
    }

    return Array.from(visited)
      .map((id) => this.getNode(id))
      .filter(Boolean);
  }

  /**
   * Check for cycles using DFS cycle detection
   * @returns {boolean} True if cycle exists
   */
  hasCycle() {
    const visited = new Set();
    const recStack = new Set();

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const outgoing = this.getOutgoingEdges(nodeId);
      for (const edge of outgoing) {
        const neighbor = edge.targetNodeId;
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true; // Cycle found
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) return true;
      }
    }

    return false;
  }

  toJSON() {
    return {
      nodes: this.getAllNodes().map((n) => n.toJSON()),
      edges: this.getAllEdges().map((e) => e.toJSON()),
    };
  }
}
