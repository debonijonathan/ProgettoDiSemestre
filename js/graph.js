var graph;
var levelIsSetted = [false, false, false, false];

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
            //id for level label
            var rootLabel = graph.insertVertex(root, null, 'Level 1', -1, 0.5, 0, 0, null, true);
            root.myId = 0;
            levelIsSetted[0] = true;
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
        graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
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

        //edit manager
        var undoManager = new mxUndoManager();
        var listener = function (sender, evt) {
            undoManager.undoableEditHappened(evt.getProperty('edit'));
        };

        //orizontal layout
        var layout = new mxCompactTreeLayout(graph);
        document.getElementById("vertical").onclick = function () {
            layout.horizontal = false;
            layout.execute(graph.getDefaultParent());
        }

        //vertical layout
        document.getElementById("orizontal").onclick = function () {
            var children = getAllChildren(graph.getDefaultParent().children[0]);
            layout.horizontal = true;
            layout.execute(graph.getDefaultParent())
            for (var i = 1; i < children.length; i++) {
                if (children[i].children != null) {
                    var pos = children[i].children[0].id;
                    graph.removeCells(children[i].children);
                    children[i].children[0] = graph.insertVertex(children[i], pos, pos, 0, -0.40, 0, 0, null, true);
                }
            }
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
function createPopupMenu(graph, menu, cell, evt) {
    if (cell != null) {
        menu.addItem('Edit label', 'img/pencil.png', function () {
            graph.startEditingAtCell(cell);
        });

        menu.addItem('Edit Image', 'img/image.png', function () {
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


        menu.addItem('Export', 'img/export.png', function () {
            var encoder = new mxCodec();
            var node = encoder.encode(graph.getModel());
            alert(mxUtils.getXml(node));
            openForm();
        });

        menu.addItem('Import', 'img/import.png', function () {
            //var xml = mxUtils.getTextContent(read("/test/test.xml"));
            location.href = "#popup3";
            var xml = "<mxGraphModel><root><mxCell id=\"0\"/><mxCell id=\"1\" parent=\"0\"/><mxCell id=\"2\" value=\"TITLE\" style=\"image=img/logo.png\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"187\" y=\"90\" width=\"140\" height=\"60\" as=\"geometry\"/></mxCell><mxCell id=\"3\" value=\"TITLE\" style=\"image=img/cloud.png\" vertex=\"1\" parent=\"1\"><mxGeometry x=\"300\" y=\"270\" width=\"140\" height=\"60\" as=\"geometry\"/></mxCell><mxCell id=\"4\" value=\"\" edge=\"1\" parent=\"1\" source=\"2\" target=\"3\"><mxGeometry relative=\"1\" as=\"geometry\"/></mxCell></root></mxGraphModel>";
            var xmlDocument = mxUtils.parseXml(xml);
            var decoder = new mxCodec(xmlDocument);
            var node = xmlDocument.documentElement;
            decoder.decode(node, graph.getModel());
            var root = graph.getModel().getCell("2");
            var cnt = 0;
            graph.traverse(root, true, function (vertex) {
                console.log("id: " + vertex.getId() + ", value: " + vertex.getValue());
                if (cnt == 0)
                    addFuntionButton(graph, vertex, false);
                else
                    addFuntionButton(graph, vertex, true);

                cnt += 1;
            });
        });
    }

};


function changeStyleCell() {
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

function addLabelWithNode(cell, vertex, parent, pos) {
    //creo il vertice lo stesso e gli assegno l'id facendo id del padre + 1
    vertex = graph.insertVertex(parent, null, 'TITLE', cell.geometry.x, cell.geometry.y + 150, 5, 5, 'image=img/cloud.png');
    //assegnamento id
    vertex.myId = cell.myId + 1;
    //se il livello in cui devo inserire la label per il livello è disponibile (cioè uguale a false) inserisco e setto a true l'array alla pos corrispndente
    if (levelIsSetted[pos] == false) {
        var stringId = 'Level ' + (pos + 1);
        var label = graph.insertVertex(vertex, stringId, 'Level ' + (pos + 1), -1, 0.5, 0, 0, null, true);
        levelIsSetted[pos] = true;
    }
    //ritorno il vertice che poi andrò ad aggiungere al mio graph
    return vertex;
}

function addNode(graph, cell) {
    var model = graph.getModel();
    var parent = graph.getDefaultParent();

    model.beginUpdate();
    try {
        //inserimento del nodo nella posizione corretta con il livello corretto
        var vertex;
        switch (cell.myId) {
            case 0:
                vertex = addLabelWithNode(cell, vertex, parent, 1);
                break;
            case 1:
                vertex = addLabelWithNode(cell, vertex, parent, 2);
                break;
            case 2:
                vertex = addLabelWithNode(cell, vertex, parent, 3);
                break;
            default:
                vertex = graph.insertVertex(parent, null, 'TITLE', cell.geometry.x, cell.geometry.y + 150, 5, 5, 'image=img/cloud.png');
                console.log(parent);
        }
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


function deleteChildrenHaveLabel(children, graph) {
    for (var i = 0; i < children.length; i++) {
        if (children[i].children != null) {
            var valueCell = children[i].children[0].value;
            switch (valueCell) {
                case "Level 2":
                    levelIsSetted[1] = false;
                    printAllNodeAt(1);
                    break;
                case "Level 3":
                    levelIsSetted[2] = false;
                    printAllNodeAt(2);
                    break;
                case "Level 4":
                    levelIsSetted[3] = false;
                    printAllNodeAt(3);
                    break;
                default:
                    console.log('Errore');
            }
        }
    }
}

function addLabel(cell, pos) {
    if (levelIsSetted[pos] == false) {
        var stringId = 'Level ' + (pos + 1);
        var label = graph.insertVertex(cell, stringId, 'Level ' + (pos + 1), -1, 0.5, 0, 0, null, true);
        levelIsSetted[pos] = true;
    }
}

function getAllChildren(root) {
    var children = [];

    // Cerco tutti i nodi figli
    graph.traverse(root, true, function (vertex) {
        children.push(vertex);
    });

    return children;
}


function printAllNodeAt(altezza) {
    var root = graph.getDefaultParent().children[0];
    var children = getAllChildren(root);

    //aggiugo a solo uno dei filgi la label
    for (var i = 0; i < children.length; i++) {
        if (children[i].myId == altezza) {
            addLabel(children[i], altezza)
            break;
        }
    }
}


function deleteNode(graph, cell) {
    // Salvo tutti i nodi figli di cell
    var children = getAllChildren(cell);

    // rimuovo tutti i figli
    graph.removeCells(children);
    //funzione per vedere quale label è stata cancellata e se è stata cancellata
    deleteChildrenHaveLabel(children, graph);

    return children;
}

function downloadFile() {
    var d = new Date();
    var encoder = new mxCodec();
    var node = encoder.encode(graph.getModel());
    var blob = new Blob([mxUtils.getPrettyXml(node)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, d + ".xml");
}

function importXML() {

}

function openForm() {
    location.href = "#popupexport";
}

function getFile(accepted) {
    document.getElementById('myFile').accept = accepted;
    document.getElementById('myFile').click();
    var x = document.getElementById("myFile");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select one or more files.";
        } else {
            for (var i = 0; i < x.files.length; i++) {
                txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
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
            txt += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
        }
    }
    //document.getElementById("demo").innerHTML = txt;
    return txt;
}