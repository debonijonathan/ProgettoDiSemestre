var graph;
function main(container) {
    // Checks if browser is supported
    if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is
        // not supported.
        mxUtils.error('Browser is not supported!', 200, false);
    }
    else {
        //Al click del pulsante destro non vengono visualizzate
        //le info del sistema operativo
        mxEvent.disableContextMenu(container);
        // Creazione del grafo all'interno del contenitore
        graph = new mxGraph(container);

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


        // Installs a popupmenu handler using local function (see below).
        graph.popupMenuHandler.factoryMethod = function(menu, cell, evt){
            return createPopupMenu(graph, menu, cell, evt);
        };

        document.getElementById("zoomIn").onclick = function () {
            graph.zoomIn();
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
            //Scala per una pagina
            var scale = mxUtils.getScaleForPageCount(1, graph);
            //print su una pagina 
            var preview = new mxPrintPreview(graph, scale);
            //preview
            preview.open();
        }

        var undoManager = new mxUndoManager();
        var listener = function (sender, evt) {
            undoManager.undoableEditHappened(evt.getProperty('edit'));
        };



        document.getElementById("save").onclick = function () {
            var encoder = new mxCodec();
            var node = encoder.encode(graph.getModel());
            mxUtils.popup(mxUtils.getPrettyXml(node), true);
        };

        var layout = new mxHierarchicalLayout(graph);

        document.getElementById("vertical").onclick = function () {

            layout.resizeParent = false;
            layout.movePArent = false;
            layout.parentBorder = 0;

            layout.intraCellSpacing = 20;
            layout.interRankCellSpacing = 50;
            layout.interHierarchySpacing = 10;

            layout.parallelEdgeSpacing = 10;

            layout.orientation = mxConstants.DIRECTION_NORTH;

            layout.fineTuning = true;
            layout.tightenToSource = true;
            layout.disableEdgeStyle = false;

            layout.execute(graph.getDefaultParent())
        }

        document.getElementById("orizontal").onclick = function () {

            layout.resizeParent = false;
            layout.movePArent = false;
            layout.parentBorder = 0;

            layout.intraCellSpacing = 20;
            layout.interRankCellSpacing = 50;
            layout.interHierarchySpacing = 10;

            layout.parallelEdgeSpacing = 10;

            layout.orientation = mxConstants.DIRECTION_WEST;

            layout.fineTuning = true;
            layout.tightenToSource = true;
            layout.disableEdgeStyle = false;

            layout.execute(graph.getDefaultParent())
        }

        var organic = new mxFastOrganicLayout(graph);
        organic.forceConstant = 120;

        document.getElementById("org").onclick = function () {
            organic.execute(graph.getDefaultParent());
        }

        graph.getModel().addListener(mxEvent.UNDO, listener);
        graph.getView().addListener(mxEvent.UNDO, listener);

        document.getElementById("undo").onclick = function () {
            undoManager.undo();
        };

        document.getElementById("redo").onclick = function () {
            undoManager.redo();
        };
    }
}

// Function to create the entries in the popupmenu
function createPopupMenu(graph, menu, cell, evt)
{
	if (cell != null)
	{
		menu.addItem('Edit label', 'img/pencil.png', function()
		{
			graph.startEditingAtCell(cell);
		});
        
        menu.addItem('Edit Image', 'img/image.png', function()
        {
             //getFile('image/x-png,image/gif,image/jpeg');
             //document.getElementById("cell").value = cell;
             //document.getElementById("graph").value = graph;

            //Setto il nuovo stile per poter cambiare immagine
            var model = graph.getModel();
            var style = new Array();
            
            style[mxConstants.STYLE_IMAGE] = 'img/image.png';

            graph.stylesheet.putCellStyle('rounded', style);
            model.setStyle(cell, 'rounded');
            location.href = "#popup2";

        });

        menu.addSeparator();

        
        menu.addItem('Export', 'img/export.png', function()
		{
            var encoder = new mxCodec();
			var node = encoder.encode(graph.getModel());
            alert(mxUtils.getXml(node));
            openForm();
        });	

        menu.addItem('Import', 'img/import.png', function()
		{
            //var xml = mxUtils.getTextContent(read("/test/test.xml"));
            var xml = "<mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/><mxCell id=\"2\" value=\"TITLE\" style=\"image=img/logo.png\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"187\" y=\"90\" width=\"140\" height=\"60\" as=\"geometry\"/></mxCell><mxCell id=\"3\" value=\"TITLE\" style=\"image=img/cloud.png\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"300\" y=\"270\" width=\"140\" height=\"60\" as=\"geometry\"/></mxCell><mxCell id=\"4\" value=\"\" edge=\"1\" parent=\"1\" source=\"2\" target=\"3\"><mxGeometry relative=\"1\" as=\"geometry\"/></mxCell></root></mxGraphModel>";
            var xmlDocument = mxUtils.parseXml(xml);
            var decoder = new mxCodec(xmlDocument);
            var node = xmlDocument.documentElement;
            decoder.decode(node, graph.getModel());

        });	
    }

};


function changeStyleCell(){
    alert("inserire l'immagine")
}



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
    return children;
}

function downloadFile(){
    var d = new Date();
    var encoder = new mxCodec();
    var node = encoder.encode(graph.getModel());
    var blob = new Blob([mxUtils.getPrettyXml(node)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, d+".xml");
}

function openForm() {
    location.href = "#popupexport";
}

function getFile(accepted){
    document.getElementById('myFile').accept=accepted;
    document.getElementById('myFile').click();
    var x = document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
        txt = "Select one or more files.";
        } else {
        for (var i = 0; i < x.files.length; i++) {
            txt += "<br><strong>" + (i+1) + ". file</strong><br>";
            var file = x.files[i];
            if ('name' in file) {
            txt += "name: " + file.name + "<br>";
            }
            if ('size' in file) {
            txt += "size: " + file.size + " bytes <br>";
            }
        }
        }
    } 
    else {
        if (x.value == "") {
        txt += "Select one or more files.";
        } else {
        txt += "The files property is not supported by your browser!";
        txt  += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
        }
    }
    //document.getElementById("demo").innerHTML = txt;
    return txt;
}