function main(container) {
    // Checks if browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        // Creazione del grafo all'interno del contenitore
        var graph = new mxGraph(container);

        //inizio finestrella in alto a sinistar
        var outline = document.getElementById('outlineContainer')

        var outln = new mxOutline(graph, outline);
        // fine

        // Impostazione dello stile di default dei nodi
        var style = graph.getStylesheet().getDefaultVertexStyle();
        setStyle(style);

        // Impostazione dello stile di default dei collegamenti ai nodi
        var edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
        setEdgeStyle(edgeStyle);

        //setAutoCreate(graph);

        //Impostiamo la scala minima a 1
        graph.cellRenderer.getTextScale = function (state) {
            return Math.min(1, state.view.scale);
        };

        //Il nodo parent
        var parent = graph.getDefaultParent();

        //Aggiunta del nodo root all'albero
        graph.getModel().beginUpdate();
        try {
            //grandezza della pagina
            var w = graph.container.offsetWidth;
            //inserimento del nodo nella posizione corretta
            var root = graph.insertVertex(parent, null, 'TITLE', (w / 2) - 100, 90, 5, 5, 'image=img/logo.png');
            //inseriemento del nodo root nel grafico
            graph.updateCellSize(root);
            //pulsante aggiungi nodo
            addFuntionButton(graph, root, false);
        }
        finally {
            // Aggiornamento del modello
            graph.getModel().endUpdate();
        }

        document.getElementById("zoomIn").onclick = function () {
            graph.zoomIn();
        }

        document.getElementById("zoomOut").onclick = function () {
            graph.zoomOut();
        }

        document.getElementById("zoomActual").onclick = function () {
            graph.zoomActual();
        }

        document.getElementById("print").onclick = function () {
            var preview = new mxPrintPreview(graph, 1);
            preview.open();
        }

        var undoManager = new mxUndoManager();
        var listener = function (sender, evt) {
            undoManager.undoableEditHappened(evt.getProperty('edit'));
        };

        graph.getModel().addListener(mxEvent.UNDO, listener);
        graph.getView().addListener(mxEvent.UNDO, listener);

        document.getElementById("undo").onclick = function () {
            undoManager.undo();
        }

        document.getElementById("redo").onclick = function () {
            undoManager.redo();
        }

        document.getElementById("save").onclick = function () {
            var encoder = new mxCodec();
            var node = encoder.encode(graph.getModel());
            mxUtils.popup(mxUtils.getPrettyXml(node), true);
        };

        document.getElementById("newPage").onclick = function () {
            //document.getElementById("bottomBar").innerHTML = '<div style="position: relative; display: inline-block; vertical-align: top; height: 30px; white-space: nowrap; overflow: hidden; font-size: 12px; margin-left: 30px;"> <div title="Page-1 (k8oaIBevAUwSV2_9oCbF)" class="geActivePage" draggable="true"style="display: inline-block; white-space: nowrap; box-sizing: border-box; position: relative; overflow: hidden; margin-left: -1px; height: 30px; padding: 8px 4px; border-width: 1px; border-style: none solid solid; border-color: rgb(192, 192, 192); background-color: rgb(238, 238, 238); cursor: move; color: gray; max-width: 140px; width: 140px; text-overflow: ellipsis; font-weight: bold;">Page-2</div></div>';
        }
    }
}

/*function setAutoCreate(graph){
    // Enables automatic layout on the graph and installs
    // a tree layout for all groups who's children are
    // being changed, added or removed.
    var layout = new mxCompactTreeLayout(graph, false);
    layout.useBoundingBox = false;
    layout.edgeRouting = false;
    layout.levelDistance = 60;
    layout.nodeDistance = 16;

    // Allows the layout to move cells even though cells
    // aren't movable in the graph
    layout.isVertexMovable = function(cell)
    {
        return true;
    };

    var layoutMgr = new mxLayoutManager(graph);

    layoutMgr.getLayout = function(cell)
    {
        if (cell.getChildCount() > 0)
        {
            return layout;
        }
	};
}*/
function setStyle(style) {
    //Rettangolo per definire un nodo
    style[mxConstants.STYLE_SHAPE] = 'label';

    //Il nostro testo di troverà in mezzo (in verticale)
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    //Il nostro testo verrà allineato a sinistra (in orizzontale)
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
    //dove inizia l'allineamento a sinitra (tenere in considerazione l'immagine)
    style[mxConstants.STYLE_SPACING_LEFT] = 50;

    style[mxConstants.STYLE_GRADIENTCOLOR] = '#ffd700';
    style[mxConstants.STYLE_STROKECOLOR] = '#db1818';
    style[mxConstants.STYLE_FILLCOLOR] = '#ffa500';

    //Colore del testo, stile, grandezza e bold
    style[mxConstants.STYLE_FONTCOLOR] = '#10100e';
    style[mxConstants.STYLE_FONTFAMILY] = 'Verdana';
    style[mxConstants.STYLE_FONTSIZE] = '20';
    style[mxConstants.STYLE_FONTSTYLE] = '1';

    //Ombreggiatura del nodo
    style[mxConstants.STYLE_SHADOW] = '1';
    //Nodo con bordi rotondi
    style[mxConstants.STYLE_ROUNDED] = '1';
    //Colori più professionali
    style[mxConstants.STYLE_GLASS] = '1';
    //Resize automatico se il testo non ci stà
    style[mxConstants.STYLE_AUTOSIZE] = '1';

    //Grandezza dell'immagine
    style[mxConstants.STYLE_IMAGE_WIDTH] = '30';
    style[mxConstants.STYLE_IMAGE_HEIGHT] = '30';
}

function setEdgeStyle(style) {
    style[mxConstants.STYLE_STROKEWIDTH] = 3;
    style[mxConstants.STYLE_STROKECOLOR] = '#000000';
}

function addFuntionButton(graph, cell, flagDelete) {
    var addOverlay = new mxCellOverlay(new mxImage('img/add.png', 20, 20), 'Add');
    addOverlay.cursor = 'hand';
    addOverlay.align = mxConstants.ALIGN_CENTER;
    addOverlay.verticalAlign = mxConstants.ALIGN_BOTTOM;
    graph.addCellOverlay(cell, addOverlay);
    addOverlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
        addNode(graph, cell);
    }));

    if (flagDelete) {
        var deleteOverlay = new mxCellOverlay(new mxImage('img/delete.png', 20, 20), 'Add');
        deleteOverlay.cursor = 'hand';
        deleteOverlay.align = mxConstants.ALIGN_RIGHT;
        deleteOverlay.verticalAlign = mxConstants.ALIGN_TOP;
        graph.addCellOverlay(cell, deleteOverlay);
        deleteOverlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
            deleteNode(graph, cell);
        }));

    }
}

function addNode(graph, cell) {
    var model = graph.getModel();
    var parent = graph.getDefaultParent();

    model.beginUpdate();
    try {
        var w = graph.container.offsetWidth;
        //inserimento del nodo nella posizione corretta
        var vertex = graph.insertVertex(parent, null, 'TITLE', w / 2 + 10, 90, 5, 5, 'image=img/cloud.png');
        //inseriemento del nodo vertex nel grafico
        graph.updateCellSize(vertex);
        //Inseriamo il collegamento tra il nodo parent e il nodo vertice
        graph.insertEdge(parent, null, '', cell, vertex);

        //pulsante aggiungi nodo
        addFuntionButton(graph, vertex, true);
    }
    finally {
        model.endUpdate();
    }
}

function deleteNode(graph, cell) {
    // Salvo tutti i nodi figli di cell
    var children = [];
    // Cerco tutti i nodi figli
    graph.traverse(cell, true, function (vertex) {
        children.push(vertex);
    });

    // rimuovo tutti i figli
    graph.removeCells(children);
}