import React from 'react';
import PropTypes from 'prop-types';
import GraphNode from '../GraphNode/GraphNode';
import GraphEdge from '../GraphEdge/GraphEdge';
import './GraphDrawer.css';

class GraphDrawer extends React.Component {
  constructor(props) {
    super(props);
    this.currentHighlightingNodeClassName = 'graph-drawer__node--current-highlighting';
    this.graphDomRef = React.createRef();
    this.graphNodeRefs = [];
  }

  componentDidUpdate() {
    // check if need update highlightingNodeSVGElement
    if (this.props.isGraphView
      && this.props.highlightingNode
      && !this.props.highlightingNodeSVGElement) {
      const highlightingNodeSVGElement = this.getHighlightingNodeSVGElement();
      this.props.onHighlightingNodeSVGElementUpdated(highlightingNodeSVGElement);
    }

    // check if need update all node's svg elements
    // this only happens once, at the first time graph is rendered
    if (this.props.isGraphView
       && this.props.layoutInitialized
       && !this.props.graphNodesSVGElements) {
      const graphNodesSVGElements = this.props.nodes.map(node => ({
        nodeID: node.id,
        svgElement: this.getNodeRef(node.id).current.getSVGElement(),
      }))
        .reduce((acc, cur) => {
          acc[cur.nodeID] = cur.svgElement;
          return acc;
        }, {});
      this.props.onGraphNodesSVGElementsUpdated(graphNodesSVGElements);
    }
  }

  onMouseOverNode = (node, e) => {
    const hoveringNodeSVGElement = e.currentTarget;
    this.props.onHoverNode(node, hoveringNodeSVGElement);
  }

  onMouseOutNode = () => {
    this.props.onCancelHoverNode();
  }

  onClickNode = (node, e) => {
    if (this.props.matchedNodeIDs && this.props.matchedNodeIDs.length > 0) { // if in search mode
      if (this.props.matchedNodeIDs.includes(node.id)) {
        this.props.onExpandMatchedNode(node.id);
      }
    } else if (!this.props.highlightingNode) { // if no node is highlighted yet
      const highlightingNodeSVGElement = e.currentTarget;
      this.props.onClickNode(node, highlightingNodeSVGElement);
    } else if (this.props.secondHighlightingNodeCandidateIDs.length > 1
      && this.props.secondHighlightingNodeCandidateIDs.includes(node.id)) {
      // only allow clicking clickable nodes
      // (only children of highlighted nodes are designed to be clickable)
      this.props.onClickNodeAsSecondHighlightingNode(node.id);
    }
  }

  getHighlightingNodeSVGElement() {
    const highlightingNodeSVGElement = document.querySelector(
      `.${this.currentHighlightingNodeClassName}`,
    );
    return highlightingNodeSVGElement;
  }

  getNodeRef = (nodeID) => {
    if (!this.graphNodeRefs[nodeID]) {
      this.graphNodeRefs[nodeID] = React.createRef();
    }
    return this.graphNodeRefs[nodeID];
  }

  render() {
    if (!this.props.layoutInitialized) return (<React.Fragment />);
    const boundingBoxLength = this.props.graphBoundingBox[2][0];
    const fittingScale = Math.min(
      this.props.canvasWidth,
      this.props.canvasHeight,
    ) / boundingBoxLength;
    const fittingTransX = Math.abs(
      (boundingBoxLength - (this.props.canvasWidth / fittingScale)) / 2,
    );
    const fittingTransY = Math.abs(
      (boundingBoxLength - (this.props.canvasHeight / fittingScale)) / 2,
    );
    return (
      <g
        className='graph-drawer'
        transform={`scale(${fittingScale}) translate(${fittingTransX}, ${fittingTransY}) `}
        ref={this.graphDomRef}
      >
        {
          this.props.edges.map((edge, i) => {
            let isEdgeFaded = false;
            let isEdgeHighlighted = false;
            if (this.props.matchedNodeIDs && this.props.matchedNodeIDs.length > 0) {
              isEdgeFaded = true;
            } else if (this.props.highlightingNode) {
              if (this.props.secondHighlightingNodeID) {
                const isEdgeAlongPathRelatedToSecondHighlightNode =
                  !!this.props.pathRelatedToSecondHighlightingNode
                    .find(e => (e.source === edge.source && e.target === edge.target));
                isEdgeFaded = !isEdgeAlongPathRelatedToSecondHighlightNode;
                isEdgeHighlighted = isEdgeAlongPathRelatedToSecondHighlightNode;
              } else {
                const isEdgeRelatedToHighlightedNode =
                  this.props.relatedNodeIDs.includes(edge.source)
                  && this.props.relatedNodeIDs.includes(edge.target);
                isEdgeFaded = !isEdgeRelatedToHighlightedNode;
                isEdgeHighlighted = isEdgeRelatedToHighlightedNode;
              }
            }
            return (
              <GraphEdge
                key={`${edge.source}-${edge.target}-${i}`}
                edge={edge}
                isRequired={edge.required}
                isFaded={isEdgeFaded}
                isHighlighted={isEdgeHighlighted}
              />
            );
          })
        }
        {
          this.props.nodes.map((node) => {
            let isNodeFaded = false;
            let isNodeClickable = true;
            let isHighlightingNode = false;
            if (this.props.matchedNodeIDs && this.props.matchedNodeIDs.length > 0) {
              isNodeFaded = !this.props.matchedNodeIDs.includes(node.id);
              isNodeClickable = !isNodeFaded;
            } else if (this.props.highlightingNode) {
              isHighlightingNode = (this.props.highlightingNode.id === node.id);
              isNodeClickable =
                this.props.secondHighlightingNodeCandidateIDs.includes(node.id);
              if (this.props.secondHighlightingNodeID) {
                isNodeFaded = !this.props.pathRelatedToSecondHighlightingNode
                  .find(e => (e.source === node.id || e.target === node.id));
              } else {
                isNodeFaded = !this.props.relatedNodeIDs.includes(node.id);
              }
            }
            return (
              <GraphNode
                key={node.id}
                node={node}
                highlightingNodeClassName={this.currentHighlightingNodeClassName}
                isHighlightingNode={isHighlightingNode}
                isFaded={isNodeFaded}
                isClickable={isNodeClickable}
                onMouseOver={e => this.onMouseOverNode(node, e)}
                onMouseOut={this.onMouseOutNode}
                onClick={e => this.onClickNode(node, e)}
                ref={this.getNodeRef(node.id)}
              />
            );
          })
        }
      </g>
    );
  }
}

GraphDrawer.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.object),
  edges: PropTypes.arrayOf(PropTypes.object),
  graphBoundingBox: PropTypes.array,
  layoutInitialized: PropTypes.bool,
  canvasWidth: PropTypes.number,
  canvasHeight: PropTypes.number,
  onHoverNode: PropTypes.func,
  onCancelHoverNode: PropTypes.func,
  onClickNode: PropTypes.func,
  highlightingNode: PropTypes.object,
  relatedNodeIDs: PropTypes.array,
  onClickNodeAsSecondHighlightingNode: PropTypes.func,
  secondHighlightingNodeID: PropTypes.string,
  secondHighlightingNodeCandidateIDs: PropTypes.arrayOf(PropTypes.string),
  pathRelatedToSecondHighlightingNode: PropTypes.arrayOf(PropTypes.object),
  highlightingNodeSVGElement: PropTypes.object,
  onHighlightingNodeSVGElementUpdated: PropTypes.func,
  isGraphView: PropTypes.bool,
  matchedNodeIDs: PropTypes.arrayOf(PropTypes.string),
  graphNodesSVGElements: PropTypes.object,
  onGraphNodesSVGElementsUpdated: PropTypes.func,
  onExpandMatchedNode: PropTypes.func,
};

GraphDrawer.defaultProps = {
  nodes: [],
  edges: [],
  graphBoundingBox: [[0, 0], [0, 1], [1, 1], [1, 0]],
  layoutInitialized: false,
  canvasWidth: 1000,
  canvasHeight: 1000,
  onHoverNode: () => {},
  onCancelHoverNode: () => {},
  onClickNode: () => {},
  highlightingNode: null,
  relatedNodeIDs: [],
  onClickNodeAsSecondHighlightingNode: () => {},
  secondHighlightingNodeID: null,
  secondHighlightingNodeCandidateIDs: [],
  pathRelatedToSecondHighlightingNode: [],
  highlightingNodeSVGElement: null,
  onHighlightingNodeSVGElementUpdated: () => {},
  isGraphView: true,
  matchedNodeIDs: [],
  graphNodesSVGElements: null,
  onGraphNodesSVGElementsUpdated: () => {},
  onExpandMatchedNode: () => {},
};

export default GraphDrawer;
