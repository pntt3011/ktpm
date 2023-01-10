const svgW = 100;
const svgH = 100;

const rectW = 90;
const rectH = 40;

const circleR = 30;


function isComposite(type) {
    return type === "composite";
}


function createElementOfShape(shape, title = "") {
    const element = document.createElement('div');

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgW);
    svg.setAttribute("height", svgH);

    if (shape === "rect") {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", (svgW - rectW) / 2);
        rect.setAttribute("y", (svgH - rectH) / 2);
        rect.setAttribute("width", rectW);
        rect.setAttribute("height", rectH);
        rect.setAttribute("fill", "white");
        rect.setAttribute("stroke-width", 1);
        rect.setAttribute("stroke", "black");
        svg.appendChild(rect);

    } else if (shape === "circle") {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", svgW / 2);
        circle.setAttribute("cy", svgH / 2);
        circle.setAttribute("r", circleR);
        circle.setAttribute("fill", "white");
        circle.setAttribute("stroke-width", 1);
        circle.setAttribute("stroke", "black");
        svg.appendChild(circle);
    }

    if (title.length > 0) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", 50);
        text.setAttribute("y", 50);
        text.setAttribute("font-size", 12);

        const textNode = document.createTextNode(title);
        text.appendChild(textNode);
        svg.appendChild(text);
    }

    element.appendChild(svg);
    return element;
}


function copyCells(cells) {
    clipboard = '';

    if (cells.length > 0) {
        const clones = graph.cloneCells(cells);

        for (var i = 0; i < clones.length; i++) {
            const state = graph.view.getState(cells[i]);

            if (state != null) {
                var geo = graph.getCellGeometry(clones[i]);
                if (geo != null && geo.relative) {
                    geo.relative = false;
                    geo.x = state.x / state.view.scale - state.view.translate.x;
                    geo.y = state.y / state.view.scale - state.view.translate.y;
                }
            }
        }

        clipboard = cellsToString(clones);
    }
}


function cellsToString(cells) {
    const codec = new mxCodec();
    const model = new mxGraphModel();
    const parent = model.getChildAt(model.getRoot(), 0);

    for (var i = 0; i < cells.length; i++) {
        model.add(parent, cells[i]);
    }

    return mxUtils.getXml(codec.encode(model));
};


function getCellAttribute(cell, attr, nodesMetadata) {
    const value = cell.getAttribute(attr, "")
    const valueType = nodesMetadata[cell.getAttribute("type", "")]["params"][attr]["type"];

    if (valueType === "integer") {
        return parseInt(value);
    }

    if (valueType === "boolean") {
        return value.toLowerCase() === "true";
    }

    if (valueType === "list_integer") {
        return value.split(',').map(function (item) {
            return parseInt(item, 10);
        });
    }

    if (valueType === "list_string") {
        return value.split(',');
    }

    return "";
}


// TODO: Huy
/**
 * @param {mxGraph} graph 
 * @param {Array.<Map<String, Array.<mxCell>>>} compositeChildrenCells: { "compositeId" : [ mxCell1, mxCell2, .. ] }
 * @param {Map<String, Map<String, Object>>} nodesMetadata: { "nodeType": { "name": string, "params": {..}, "shape": string, "short_name": string } } 
 * @returns {List.<Map<String, Object>>} List of nodes
 */
function graphToNodes(graph, compositeChildrenCells, nodesMetadata) {
    const cells = Object.values(graph.model.cells);
    let graphNodes = compositeToNodes(cells, nodesMetadata);

    for (composite in compositeChildrenCells) {
        graphNodes = graphNodes.concat(compositeToNodes(compositeChildrenCells[composite], nodesMetadata))
    }

    return graphNodes;
}


function compositeToNodes(cells, nodesMetadata) {
    const results = [];

    for (let i = 0; i < cells.length; i++) {
        if (cells[i].vertex) {
            results.push(
                {
                    "id": cells[i].id,
                    "label": cells[i].getAttribute('type', ""),
                    "params": parseNodeParams(cells[i], nodesMetadata),
                    "inputs": {},
                    "outputs": {}
                }
            )
        }
    }

    parseInputOutput(results, cells);

    return results;
}


function parseNodeParams(cell, nodesMetadata) {
    const results = {};
    const type = cell.getAttribute('type', "");

    for (param in nodesMetadata[type]["params"]) {
        results[param] = getCellAttribute(cell, param, nodesMetadata);
    }

    return results;
}

function parseInputOutput(results, cells) {
    for (let i = 0; i < results.length; ++i) {
        const result = results[i];
        const cell = findCellById(result["id"], cells);
        if (cell == null) {
            continue;
        }

        const cellInputs = getInputsOfCell(cell, cells)
        const input = result["inputs"]
        for (let i = 0; i < cellInputs.length; ++i) {
            input[cellInputs[i].id] = "x" + i;
        }

        const cellOutputs = getOutputsOfCell(cell, cells)
        const output = result["outputs"]
        for (let i = 0; i < cellOutputs.length; ++i) {
            output[cellOutputs[i].id] = "x" + i;
        }
    }

    return results;
}


function findCellById(id, cells) {
    for (let i = 0; i < cells.length; ++i) {
        if (cells[i].id === id && cells[i].vertex) {
            return cells[i];
        }
    }
    return null;
}


function getInputsOfCell(cell, cells) {
    const results = [];

    for (let i = 0; i < cells.length; ++i) {
        if (cells[i].edge && cells[i].target.id == cell.id) {
            results.push(cells[i].source);
        }
    }

    return results;
}


function getOutputsOfCell(cell, cells) {
    const results = [];

    for (let i = 0; i < cells.length; ++i) {
        if (cells[i].edge && cells[i].source.id == cell.id) {
            results.push(cells[i].target);
        }
    }

    return results;
}