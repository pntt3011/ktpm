let graph = undefined;
let compositeChildrenNodes = {};

// Nodes' label, params and default values
let nodesMetadata = {};

// For copy, paste
let clipboard = '';
let lastPaste = '';
let dx = 0;
let dy = 0;
let gs = 0;


// Start loading HTML head
function onLoadHTMLHead() {
    setupMxGraph();
}


function setupMxGraph() {
    // Overridden to define per-shape connection points
    mxGraph.prototype.getAllConnectionConstraints = function (terminal, source) {
        if (terminal != null && terminal.shape != null) {
            if (terminal.shape.stencil != null) {
                if (terminal.shape.stencil.constraints != null) {
                    return terminal.shape.stencil.constraints;
                }
            }
            else if (terminal.shape.constraints != null) {
                return terminal.shape.constraints;
            }
        }

        return null;
    };

    // Defines the default constraints for all shapes
    mxShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
    new mxConnectionConstraint(new mxPoint(0.5, 0), true),
    new mxConnectionConstraint(new mxPoint(0.75, 0), true),
    new mxConnectionConstraint(new mxPoint(0, 0.25), true),
    new mxConnectionConstraint(new mxPoint(0, 0.5), true),
    new mxConnectionConstraint(new mxPoint(0, 0.75), true),
    new mxConnectionConstraint(new mxPoint(1, 0.25), true),
    new mxConnectionConstraint(new mxPoint(1, 0.5), true),
    new mxConnectionConstraint(new mxPoint(1, 0.75), true),
    new mxConnectionConstraint(new mxPoint(0.25, 1), true),
    new mxConnectionConstraint(new mxPoint(0.5, 1), true),
    new mxConnectionConstraint(new mxPoint(0.75, 1), true)];

    // Edges have no connection points
    mxPolyline.prototype.constraints = null;
}


// Finish loading HTML body 
function onHTMLBodyLoaded() {

    loadNodesFromServer();

    setupGraphArea();
}


function loadNodesFromServer() {
    fetch('/nodes', {
        method: 'GET'
    }).then(async (response) => {
        const nodes = await response.json();

        const nodeContainer = document.getElementById("node-container");
        nodeContainer.replaceChildren();

        for (nodeType in nodes) {
            if (!isComposite(nodeType)) {
                const node = createNodeUI(nodeType, nodes[nodeType]);
                nodeContainer.appendChild(node);
            }
        }

        nodesMetadata = nodes;
    })
}


function createNodeUI(type, data) {
    const element = createElementOfShape(data["shape"], data["short_name"]);
    element.classList.add("node-item");
    element.classList.add("center-children");
    element.classList.add("horizontal-layout");
    element.onclick = function () {
        graph.getModel().beginUpdate();
        try {
            const cell = addNewVertex(type);
            graph.updateCellSize(cell, true);
        }
        finally {
            graph.getModel().endUpdate();
        }
    }

    return element;
}


function addNewVertex(type, x = null, y = null) {
    const nodeData = nodesMetadata[type];

    // Convert params to xml object
    const value = createValueObject(type);

    // Calculate position to place
    if (x == null) {
        x = graph.container.offsetWidth * (0.4 + (Math.random() * 0.2));
    }
    if (y == null) {
        y = graph.container.offsetHeight * (0.4 + (Math.random() * 0.2));
    }

    // Calculate some values based on shape
    let style = "";
    let w = 0;
    let h = 0;

    const shape = nodeData["shape"];
    if (shape === 'rect') {
        w = rectW;
        h = rectH;
        style = `shape=${mxConstants.SHAPE_RECTANGLE};minWidth=${w};minHeight=${h}`;

    } else if (shape === 'circle') {
        w = circleR * 2;
        h = circleR * 2;
        style = `shape=${mxConstants.SHAPE_ELLIPSE};minWidth=${w};minHeight=${h}`;
    }

    // Update graph
    const parent = graph.getDefaultParent();
    return graph.insertVertex(parent, null, value, x, y, w, h, style);
}


function createValueObject(type) {
    const nodeData = nodesMetadata[type];
    const doc = mxUtils.createXmlDocument();
    const value = doc.createElement("NewNode");

    value.setAttribute('type', type);
    value.setAttribute('label', nodeData["name"]);
    value.setAttribute('is_editable', !isComposite(type));

    for (param in nodeData["params"]) {
        value.setAttribute(param, nodeData["params"][param]["value"]);
    }
    return value;
}


function setupGraphArea() {
    const container = document.getElementById("graph-container");

    // Create new graph object
    graph = createGraphObject(container);
    gs = graph.gridSize;

    // Listen to user events
    setupUserEventListener();
}


function createGraphObject(container) {
    const graph = new mxGraph(container);

    graph.setAllowDanglingEdges(false);
    graph.setConnectable(true);
    graph.setCellsEditable(false);

    graph.getStylesheet().getDefaultEdgeStyle()['edgeStyle'] = 'orthogonalEdgeStyle';

    graph.getStylesheet().getDefaultVertexStyle()['verticalAlign'] = 'middle';
    graph.getStylesheet().getDefaultVertexStyle()['fontSize'] = 14;

    // Set graph to show "label" field in vertex
    graph.convertValueToString = function (cell) {
        if (mxUtils.isNode(cell.value)) {
            return cell.getAttribute('label', '')
        }
    };

    // Allow fit cell but keep minWidth and minHeight
    const graphGetPreferredSizeForCell = graph.getPreferredSizeForCell;
    graph.getPreferredSizeForCell = function (cell) {
        var result = graphGetPreferredSizeForCell.apply(this, arguments);
        var style = this.getCellStyle(cell);

        if (style['minWidth'] > 0) {
            result.width = Math.max(style['minWidth'], result.width);
        }

        if (style['minHeight'] > 0) {
            result.height = Math.max(style['minHeight'], result.height);
        }

        return result;
    };

    // Enable egde preview
    graph.connectionHandler.createEdgeState = function (me) {
        var edge = graph.createEdge(null, null, null, null, null);
        return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
    };

    // Enable dragging to select multi cells
    new mxRubberband(graph);

    return graph;
}


function setupUserEventListener() {
    // Copy
    document.addEventListener('copy', function (event) {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            const cells = graph.getSelectionCells();
            copyCells(cells);
            lastPaste = '';
            dx = 0;
            dy = 0;
        }
    });

    // Cut
    document.addEventListener('cut', function (event) {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            const cells = graph.getSelectionCells();

            graph.getModel().beginUpdate();
            try {
                graph.removeCells(cells);
            }
            finally {
                graph.getModel().endUpdate();
            }

            copyCells(cells);
            lastPaste = '';
            dx = -gs;
            dy = -gs;
        }
    });

    document.addEventListener('paste', function (event) {
        if (graph.isEnabled()) {
            pasteCells();
        }
    });

    // Delete
    document.addEventListener('keydown', function (event) {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            if (event.key === "Delete") {
                graph.getModel().beginUpdate();
                try {
                    let cells = graph.getSelectionCells();
                    graph.removeCells(cells);
                }
                finally {
                    graph.getModel().endUpdate();
                }
            }
        }
    });

    // Ctrl + mouse scroll to zoom
    document.addEventListener('wheel', function (event) {
        if (!mxEvent.isConsumed(event)) {

            if (event.ctrlKey) {
                event.preventDefault();

                if (event.deltaY < 0) {
                    graph.zoomIn();
                }
                else {
                    graph.zoomOut();
                }
            }
            mxEvent.consume(event);
        }
    }, { passive: false });


    // Select a single cell
    graph.selectionModel.addListener(mxEvent.CHANGE, function (sender, event) {
        const container = document.getElementById("edit-container");
        container.replaceChildren();

        const cells = graph.getSelectionCells();
        if (cells.length == 1) {
            showCellParams(container, cells[0]);
        }
    });

}


function pasteCells() {
    const xml = mxUtils.trim(clipboard);

    if (xml.length > 0) {
        if (lastPaste.length > 0 && lastPaste !== xml) {
            lastPaste = xml;
            dx = 0;
            dy = 0;
        }
        else {
            dx += gs;
            dy += gs;
        }

        if (xml.substring(0, 14) == '<mxGraphModel>') {
            graph.setSelectionCells(importCellsFromXML(xml));
        }
    }
}


// Reference: https://github.com/jgraph/mxgraph/blob/master/javascript/examples/clipboard.html#L169
function importCellsFromXML(xml) {
    let cells = [];

    try {
        const doc = mxUtils.parseXml(xml);
        const node = doc.documentElement;

        if (node != null) {
            const model = new mxGraphModel();
            const codec = new mxCodec(node.ownerDocument);
            codec.decode(node, model);

            const childCount = model.getChildCount(model.getRoot());
            const targetChildCount = graph.model.getChildCount(graph.model.getRoot());

            graph.model.beginUpdate();
            try {
                for (var i = 0; i < childCount; i++) {
                    const parent = model.getChildAt(model.getRoot(), i);

                    if (targetChildCount > i) {
                        var target = (childCount == 1) ? graph.getDefaultParent() : graph.model.getChildAt(graph.model.getRoot(), i);

                        if (!graph.isCellLocked(target)) {
                            var children = model.getChildren(parent);
                            cells = cells.concat(graph.importCells(children, dx, dy, target));
                        }
                    }
                    else {
                        parent = graph.importCells([parent], 0, 0, graph.model.getRoot())[0];
                        var children = graph.model.getChildren(parent);
                        graph.moveCells(children, dx, dy);
                        cells = cells.concat(children);
                    }
                }
            }
            finally {
                graph.model.endUpdate();
            }
        }
    }
    catch (e) {
        alert(e);
        throw e;
    }

    return cells;
};


function showCellParams(container, cell) {
    if (cell.getAttribute("is_editable", "") !== "true") {
        return;
    }

    const type = cell.getAttribute("type", "")
    const params = Object.keys(nodesMetadata[type]["params"]);

    for (let i = 0; i < params.length; ++i) {
        const param = params[i];
        const id = "edit-" + param;

        const label = document.createElement("label");
        label.setAttribute("for", id);
        label.innerHTML = param;

        const input = document.createElement("input");
        input.id = id;
        input.value = cell.getAttribute(param, "");
        input.addEventListener('focusout', function (event) {
            cell.setAttribute(param, event.target.value);
        });

        container.appendChild(label);
        container.appendChild(input);
    }
}


function groupSelectionCells() {
    const cells = graph.getSelectionCells()

    if (cells.length > 0) {
        const groupCenter = getCenterPointOfCells(cells);
        graph.getModel().beginUpdate();
        try {
            graph.removeCells(cells);

            const cell = addNewVertex("composite", groupCenter["cx"], groupCenter["cy"]);
            graph.updateCellSize(cell, true);

            compositeChildrenNodes[cell.id] = cells;
            cell.setAttribute("children", cells.map(x => x.id));
        }
        finally {
            graph.getModel().endUpdate();
        }
    }
}


function exportGraph(filename) {
    const nodes = graphToNodes(graph, compositeChildrenNodes, nodesMetadata);

    fetch("/export", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(nodes)
    }).then(async (response) => {

        const data = await response.json()
        const code = data["result"]

        if (code != undefined) {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(code));
            element.setAttribute('download', filename);
            element.style.display = 'none';

            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    })
}