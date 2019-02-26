function main() {
    // Checks if browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        var container = document.createElement('div');
        document.body.appendChild(container);

        // Creazione del grafo all'interno del contenitore
        var graph = new mxGraph(container);


        // Impostazione dello stile di default dei nodi
        var style = graph.getStylesheet().getDefaultVertexStyle();
        setStyle(style);


        //Il nodo parent
        var parent = graph.getDefaultParent();

        //Aggiunta del nodo root all'albero
        graph.getModel().beginUpdate();
        try {
            //grandezza della pagina
            var w = graph.container.offsetWidth;
            //inserimento del nodo nella posizione corretta
            var root = graph.insertVertex(parent, null, 'TITLE', w / 2 + 10, 90, 5, 5, 'image=img/logo.png');
            //inseriemento del nodo root nel grafico
            graph.updateCellSize(root);
            //pulsante aggiungi nodo
            addFuntionButton(graph, root, true);
        }
        finally {
            // Aggiornamento del modello
            graph.getModel().endUpdate();
        }

    }
}

function setStyle(style) {
    //Rettangolo per definire un nodo
    style[mxConstants.STYLE_SHAPE] = 'label';

    //Il nostro testo di troverà in mezzo (in verticale)
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    //Il nostro testo verrà allineato a sinistra (in orizzontale)
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
    //dove inizia l'allineamento a sinitra (tenere in considerazione l'immagine)
    style[mxConstants.STYLE_SPACING_LEFT] = 75;

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

function addFuntionButton(graph, cell, flagDelete) {
    var addOverlay = new mxCellOverlay(new mxImage('img/add.png', 20, 20), 'Add');
    addOverlay.cursor = 'hand';
    addOverlay.align = mxConstants.ALIGN_CENTER;
    addOverlay.verticalAlign = mxConstants.ALIGN_BOTTOM;
    graph.addCellOverlay(cell, addOverlay);
    addOverlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
        addNode(graph, cell);
        alert("ciao berra!")
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