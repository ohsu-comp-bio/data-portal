const ddgraphInitialState = {
  isGraphView: true,
  layoutInitialized: false,
  nodes: [],
  edges: [],
  graphBoundingBox: [],
  legendItems: [],
  hoveringNode: null,
  hoveringNodeSVGElement: null,
  highlightingNode: null,
  highlightingNodeSVGElement: null,
  relatedNodeIDs: [],
  secondHighlightingNodeID: null,
  dataModelStructure: null,
  overlayPropertyHidden: true,
  canvasBoundingRect: { top: 0, left: 0 },
  needReset: false,
  tableExpandNodeID: null,
};

const ddgraph = (state = ddgraphInitialState, action) => {
  switch (action.type) {
  case 'GRAPH_TABLE_VIEW': {
    return {
      ...state,
      isGraphView: action.isGraphView,
      overlayPropertyHidden: true,
    };
  }
  case 'GRAPH_LAYOUT': {
    return {
      ...state,
      nodes: action.nodes,
      edges: action.edges,
      graphBoundingBox: action.graphBoundingBox,
      layoutInitialized: true,
    };
  }
  case 'GRAPH_LEGEND': {
    return {
      ...state,
      legendItems: action.legendItems,
    };
  }
  case 'GRAPH_HOVER_NODE': {
    return {
      ...state,
      hoveringNode: action.node,
      hoveringNodeSVGElement: action.hoveringNodeSVGElement,
    };
  }
  case 'GRAPH_CANVAS_BOUNDING_RECT_UPDATE': {
    return {
      ...state,
      canvasBoundingRect: action.canvasBoundingRect,
    };
  }
  case 'GRAPH_RELATED_NODE': {
    return {
      ...state,
      relatedNodeIDs: action.relatedNodeIDs,
    };
  }
  case 'GRAPH_FURTHER_HIGHLIGHT_NODE': {
    const newSecondHighlightingNodeID = action.nodeID;
    return {
      ...state,
      secondHighlightingNodeID: newSecondHighlightingNodeID,
    };
  }
  case 'GRAPH_FURTHER_CLICKABLE_NODES': {
    return {
      ...state,
      clickableHighlightedNodeIDs: action.clickableHighlightedNodeIDs,
    };
  }
  case 'GRAPH_FURTHER_HIGHLIGHT_PATH': {
    return {
      ...state,
      furtherHighlightedPath: action.furtherHighlightedPath,
    };
  }
  case 'GRAPH_DATA_MODEL_STRUCTURE': {
    return {
      ...state,
      dataModelStructure: action.dataModelStructure,
    };
  }
  case 'GRAPH_OVERLAY_PROPERTY_HIDDEN': {
    return {
      ...state,
      overlayPropertyHidden: action.isHidden,
    };
  }
  case 'GRAPH_CANVAS_NEED_RESET': {
    return {
      ...state,
      needReset: action.needReset,
    };
  }
  case 'GRAPH_HIGHLIGHTING_NODE_SVG_ELEMENT': {
    return {
      ...state,
      highlightingNodeSVGElement: action.highlightingNodeSVGElement,
    };
  }
  case 'GRAPH_HIGHLIGHT_NODE': {
    let newHighlightingNode = null;
    let newHighlightingNodeSVGElement = null;
    if (action.node && (!state.highlightingNode || state.highlightingNode.id !== action.node.id)) {
      newHighlightingNode = action.node;
      newHighlightingNodeSVGElement = action.highlightingNodeSVGElement;
    }
    const newTableExpandNodeID = newHighlightingNode ? newHighlightingNode.id : null;
    return {
      ...state,
      highlightingNode: newHighlightingNode,
      highlightingNodeSVGElement: newHighlightingNodeSVGElement,
      secondHighlightingNodeID: null,
      tableExpandNodeID: newTableExpandNodeID,
    };
  }
  case 'GRAPH_CLICK_BLANK_SPACE': {
    let newHighlightingNode = state.highlightingNode;
    let newSecondHighlightingNodeID = state.secondHighlightingNodeID;
    let newTableExpandNodeID = state.tableExpandNodeID;
    let newHighlightingNodeSVGElement = state.highlightingNodeSVGElement;
    if (state.highlightingNode) {
      if (state.secondHighlightingNodeID) {
        newSecondHighlightingNodeID = null;
      } else {
        newHighlightingNode = null;
        newTableExpandNodeID = null;
        newHighlightingNodeSVGElement = null;
      }
    }
    return {
      ...state,
      highlightingNode: newHighlightingNode,
      secondHighlightingNodeID: newSecondHighlightingNodeID,
      tableExpandNodeID: newTableExpandNodeID,
      highlightingNodeSVGElement: newHighlightingNodeSVGElement,
    };
  }
  case 'TABLE_EXPAND_NODE_ID': {
    let newHighlightingNode = null;
    if (action.nodeID) {
      newHighlightingNode = state.nodes.find(n => n.id === action.nodeID);
    }
    return {
      ...state,
      tableExpandNodeID: action.nodeID,
      highlightingNode: newHighlightingNode,
      secondHighlightingNodeID: null,
      highlightingNodeSVGElement: null,
    };
  }
  default:
    return state;
  }
};

export default ddgraph;
