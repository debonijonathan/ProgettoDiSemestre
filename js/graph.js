/*****************************************************
 * Nome: graph.js
 * 
 * Autori: J. De Boni, G. Zorloni  
 * 
 * Descrizione: Tramite questo programma si può
 * creare una mindmap con la quale gestire/manipolare
 * i propri progetti e le proprie idee.
 * 
 ******************************************************/

var graph;
var cellImage;
var createCell;
var levelIsSetted = [false, false, false, false];
var graphOrientation = 0;
var graphStyle = 0;
var doc = mxUtils.createXmlDocument();

//funzione per la creazione/manipolazione del grafico 
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
        mxConnectionHandler.prototype.connectImage = new mxImage('img/connector.gif', 16, 16);

        // Creazione del grafo all'interno del contenitore
        graph = new mxGraph(container);
        graph.setConnectable(true);

        //inizio finestrella in alto a sinistar
        var outline = document.getElementById('outlineContainer')

        var outln = new mxOutline(graph, outline);

        // Impostazione dello stile di default dei nodi
        var style = graph.getStylesheet().getDefaultVertexStyle();
        setStyle(style, '#ffd700', '#db1818', '#ffa500');

        // Impostazione dello stile di default dei collegamenti ai nodi
        var edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
        setEdgeStyle(edgeStyle);

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
            root.todo = 0;
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
        // Aggiunta del handler per la tastiera
        var keyHandler = new mxKeyHandler(graph);

        //Aggiunta del nodo tramite tasto tab
        keyHandler.bindKey(9, function (evt) {
            if (graph.isEnabled()) {
                addNode(graph, graph.getModel().getCell(graph.getSelectionCell().getId()));
            }
        });

        //Aggiunta del nodo tramite tasto enter
        keyHandler.bindKey(13, function (evt) {
            if (graph.isEnabled()) {
                var parent = graph.getModel().getCell(graph.getSelectionCell().myparent);
                if (parent.getId() != 1) {
                    addNode(graph, parent);
                }
            }
        });

        //Aggiunta del nodo allo stesso livello di quello selezionato
        keyHandler.bindKey(46, function (evt) {
            var parent = graph.getModel().getCell(graph.getSelectionCell().getId());
            console.log(parent.style);
            if (graph.isEnabled()) {
                if (graph.getSelectionCell().getId() != 2) {
                    if (parent.style == "note") {
                        graph.getModel().remove(parent);
                    } else
                        deleteNode(graph, parent);
                }
            }
        });

        //Zoom nel grafico
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

        document.getElementById("note").onclick = function () {
            addNode(graph, graph.getDefaultParent());
            createStyleNote(graph, createCell, "note");
            console.log(createCell.getId());
            graph.removeCellOverlays(createCell);
        }

        //edit manager
        var undoManager = new mxUndoManager();
        var listener = function (sender, evt) {
            undoManager.undoableEditHappened(evt.getProperty('edit'));
        };

        graph.getModel().addListener(mxEvent.UNDO, listener);
        graph.getView().addListener(mxEvent.UNDO, listener);

        document.getElementById("undo").onclick = function () {
            undoManager.undo();
        };

        document.getElementById("redo").onclick = function () {
            undoManager.redo();
        };

        document.getElementById("defaultStyle").onclick = function () {
            graphStyle = 0;
            changeStyle(setStyle(style, '#ffd700', '#db1818', '#ffa500'));
            changeBorderStyle('red', '#ffd700');
        }

        document.getElementById("style2").onclick = function () {
            graphStyle = 1;
            changeStyle(setStyle(style, '#808080', '#000000', '#808080'));
            changeBorderStyle('black', '#808080');
        }

        document.getElementById("style3").onclick = function () {
            graphStyle = 2;
            changeStyle(setStyle(style, '#ffffff', '#000000', '#ffffff'));
            changeBorderStyle('black', '#ffffff');
        }
    }
}
//funzione per il cambiamento dello stile 
function changeStyle(callback) {
    graph.getModel().beginUpdate();
    try {
        if (callback && typeof callback === 'function')
            callback();
    } finally {
        graph.getModel().endUpdate();
        graph.refresh();
    }
}

//funzione per cambiare il colore del bordo di un singolo nodo
function changeBorderStyle(value1, value2) {
    graph.getModel().beginUpdate();
    try {
        var children = getAllChildren(graph.getDefaultParent().children[0]);
        var stylesheet;
        if (children != null) {
            for (var i = 1; i < children.length; i++) {
                stylesheet = children[i].style;
                if (children[i].myId == 0 || children[i].myId == 1) {
                    children[i].style = stylesheet + ';strokeColor=' + value1 + ';';
                } else {
                    children[i].style = stylesheet + ';strokeColor=' + value2 + ';';
                }
            }
        }
    } finally {
        graph.getModel().endUpdate();
        graph.refresh();
    }
}

/*function borderColor(value1, value2, value3){
    if (graphStyle == 0) {
        cell.style = stylesheet + ';strokeColor=#db1818;';
    } else if (graphStyle == 1) {
        cell.style = stylesheet + ';strokeColor=#000000;';
    } else if (graphStyle == 2) {
        cell.style = stylesheet + ';strokeColor=#000000;';
    }
}**/

function borderColorAddNode(cell) {
    var stylesheet = cell.style;
    if (cell.myId == 1) {
        if (graphStyle == 0) {
            cell.style = stylesheet + ';strokeColor=#db1818;';
        } else if (graphStyle == 1) {
            cell.style = stylesheet + ';strokeColor=#000000;';
        } else if (graphStyle == 2) {
            cell.style = stylesheet + ';strokeColor=#000000;';
        }
    } else {
        if (graphStyle == 0) {
            cell.style = stylesheet + ';strokeColor=#ffd700;';
        } else if (graphStyle == 1) {
            cell.style = stylesheet + ';strokeColor=#808080;';
        } else if (graphStyle == 2) {
            cell.style = stylesheet + ';strokeColor=#ffffff;';
        }
    }
    return cell;
}

//funzione per la rimozione delle label nei figli
function removeLabels(children) {
    var pos = [];
    var i = 0;
    var cnt = 0;

    for (i = 1; i < children.length; i++)
        if (children[i].children != null)
            pos[cnt++] = children[i].children[0];
    graph.removeCells(pos);

    for (i = 0; i < pos.length; i++)
        if (typeof (pos[i]) != "undefined") {
            if (pos[i].value == "Level 2") {
                levelIsSetted[1] = false;
            } else if (pos[i].value == "Level 3") {
                levelIsSetted[2] = false;
            } else if (pos[i].value == "Level 4") {
                levelIsSetted[3] = false;
            }
        }

    return pos;
}

function createStyleNote(graph, cell, name) {
    var model = graph.getModel();
    var style = new Array();
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#ffffff';
    style[mxConstants.STYLE_STROKECOLOR] = '#000000';
    style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';

    style[mxConstants.STYLE_SHAPE] = 'cloud';

    //Il nostro testo di troverà in mezzo (in verticale)
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    //Il nostro testo verrà allineato a sinistra (in orizzontale)
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;

    //Colore del testo, stile, grandezza e bold
    style[mxConstants.STYLE_FONTCOLOR] = '#10100e';
    style[mxConstants.STYLE_FONTFAMILY] = 'Verdana';
    style[mxConstants.STYLE_FONTSIZE] = '14';
    style[mxConstants.STYLE_FONTSTYLE] = '2';

    //Ombreggiatura del nodo
    style[mxConstants.STYLE_SHADOW] = '1';
    //Nodo con bordi rotondi
    style[mxConstants.STYLE_ROUNDED] = '1';
    //Colori più professionali
    style[mxConstants.STYLE_GLASS] = '1';
    //Resize automatico se il testo non ci stà
    style[mxConstants.STYLE_AUTOSIZE] = '1';

    graph.stylesheet.putCellStyle(name, style);
    model.setStyle(cell, name);
}
//funzione per l'aggiunta delle label nei nodi
function addLabels(pos) {
    for (var i = 0; i < pos.length; i++) {
        printAllNodeAt(i + 1);
    }
}

//funzione per l'ordinamento delle grafico in modo verticale
// e sistemazione delle label nel posto giusto
function verticalOrganization() {
    graphOrientation = 0;
    var children = getAllChildren(graph.getDefaultParent().children[0]);
    var pos = removeLabels(children);
    addLabels(pos);
    var layout = new mxCompactTreeLayout(graph);
    layout.horizontal = false;
    layout.execute(graph.getDefaultParent());
}

//funzione per l'ordinamento delle grafico in modo orizzontale
// e sistemazione delle label nel posto giusto
function orizzontalOrganization() {
    graphOrientation = 1;
    var children = getAllChildren(graph.getDefaultParent().children[0]);
    var pos = removeLabels(children);
    addLabels(pos);
    var layout = new mxCompactTreeLayout(graph);
    layout.horizontal = true;
    layout.execute(graph.getDefaultParent())
}

//funzione per l'ordinamento delle grafico in modo mindmap
// e sistemazione delle label nel posto giusto
function mindmapOrganization() {
    graphOrientation = 2;
    var organic = new mxFastOrganicLayout(graph);
    organic.forceConstant = 120;
    organic.execute(graph.getDefaultParent());
}

// funzione per la creazione del popupmenu alla pressione del tasto destro
function createPopupMenu(graph, menu, cell, evt) {
    if (cell != null) {
        var bool = false;
        try {
            if (cell.getStyle().charAt(0) == "n")
                bool = true;
            else
                bool = false;
        } catch (err) {
            bool = false;
        }
        if (!bool) {
            menu.addItem('IsTODO', 'img/check.png', function () {
                //Creazione del todo per la cella corrente
                var v = graph.getSelectionCell();
                if (v.todo == 0) {
                    addTodo(graph, v);
                } else {
                    cell.todo = 0;
                    graph.removeCellOverlays(cell);
                    if (v.getId() != 2)
                        addFuntionButton(graph, cell, true);
                    else
                        addFuntionButton(graph, cell, false);
                }

            });

            menu.addSeparator();

            menu.addItem('Edit label', 'img/pencil.png', function () {
                //Setto la label in modo da editarlo
                graph.startEditingAtCell(cell);
            });

            menu.addItem('Edit Image', 'img/image.png', function () {
                //Setto il nuovo stile per poter cambiare immagine
                cellImage = cell;
                location.href = "#popup2";
            });

            menu.addSeparator();
        }

        menu.addItem('Export', 'img/export.png', function () {
            var encoder = new mxCodec();
            var node = encoder.encode(graph.getModel());
            openForm();
        });

        menu.addItem('Import', 'img/import.png', function () {
            location.href = "#popup3";
        });
    }
};

//funzione per l'aggiunta/gestione del todo
function addTodo(graph, cell) {
    var overlay = new mxCellOverlay(
        new mxImage('img/checked.png', 20, 20),
        'Checked');
    overlay.align = mxConstants.ALIGN_RIGHT;
    overlay.verticalAlign = mxConstants.ALIGN_CENTER;
    cell.todo = 1;
    // impostiamo l'overlay per le celle nel grafico
    graph.addCellOverlay(cell, overlay);
}

//funzione per l'aggiunta dello stile di default
function setStyle(style, value1, value2, value3) {
    //Rettangolo per definire un nodo
    style[mxConstants.STYLE_SHAPE] = 'label';

    //Il nostro testo si troverà in mezzo (in verticale)
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    //Il nostro testo verrà allineato a sinistra (in orizzontale)
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
    //dove inizia l'allineamento a sinitra (tenere in considerazione l'immagine)
    style[mxConstants.STYLE_SPACING_LEFT] = 50;

    //style[mxConstants.STYLE_GRADIENTCOLOR] = '#ffd700';
    //style[mxConstants.STYLE_STROKECOLOR] = '#db1818';
    //style[mxConstants.STYLE_FILLCOLOR] = '#ffa500';

    style[mxConstants.STYLE_GRADIENTCOLOR] = value1;
    style[mxConstants.STYLE_STROKECOLOR] = value2;
    style[mxConstants.STYLE_FILLCOLOR] = value3;

    style[mxConstants.STYLE_STROKEWIDTH] = 3;

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

function setStyle2(style) {
    style[mxConstants.STYLE_FONTFAMILY] = "Salesforce Sans";
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CLOUD;
    style[mxConstants.STYLE_FOLDABLE] = 0;
    style[mxConstants.STYLE_ARCSIZE] = 9;
    style[mxConstants.STYLE_FILLCOLOR] = "#A6B8CE";
    style[mxConstants.STYLE_STROKECOLOR] = "#7591b3";//original
    style[mxConstants.STYLE_STROKEWIDTH] = 1;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;

}

function setEdgeStyle(style) {
    style[mxConstants.STYLE_STROKEWIDTH] = 3;
    style[mxConstants.STYLE_STROKECOLOR] = '#000000';
}

//funzione per poter visualizzare il pulsante elimina e aggiungi nodo
function addFuntionButton(graph, cell, flagDelete) {
    var addOverlay = new mxCellOverlay(new mxImage('img/add.png', 20, 20), 'Add');
    addOverlay.cursor = 'hand';
    addOverlay.align = mxConstants.ALIGN_CENTER;
    addOverlay.verticalAlign = mxConstants.ALIGN_BOTTOM;
    graph.addCellOverlay(cell, addOverlay);
    addOverlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
        addNode(graph, cell);
    }));
    //se non è il primo allora metti il flag per poterlo cancellare
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

//funzione per aggiungere una label ad uno nodo che dovrebbe averla
function addLabelWithNode(cell, vertex, parent, pos) {
    //creo il vertice lo stesso e gli assegno l'id facendo id del padre + 1
    vertex = graph.insertVertex(parent, null, 'TITLE', 0, 0, 5, 5, 'image=img/cloud.png');
    //assegnamento id
    vertex.myId = cell.myId + 1;
    //per lo stile del bordo del nodo che devo creare
    borderColorAddNode(vertex);
    //se il livello in cui devo inserire la label per il livello è disponibile (cioè uguale a false) inserisco e setto a true l'array alla pos corrispndente
    addLabel(vertex, pos);
    //ritorno il vertice che poi andrò ad aggiungere al mio graph
    return vertex;
}

//aggiungo i nodi nel caso in cui debbano essere aggiunte delle label li aggiungo con esse,
//altrimenti senza di esse.
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
                vertex = graph.insertVertex(parent, null, 'TITLE', 0, 0, 5, 5, 'image=img/cloud.png');
        }
        vertex.todo = 0;
        vertex.myparent = cell.getId();
        //inseriemento del nodo vertex nel grafico
        graph.updateCellSize(vertex);
        createCell = vertex;
        //Inseriamo il collegamento tra il nodo parent e il nodo vertice
        graph.insertEdge(parent, null, '', cell, vertex);
        //pulsante aggiungi nodo
        addFuntionButton(graph, vertex, true);
    }
    finally {
        model.endUpdate();
    }
    //una volta aggiunti i nodi richiamo la funzione giusta per organizare il grafico di conseguenza
    organizzationMethod(graphOrientation);
}

//metodi per vedere quale tipo di organizzazione è stata scelta
function organizzationMethod(value) {
    switch (value) {
        case 0:
            verticalOrganization();
            break;
        case 1:
            orizzontalOrganization();
            break;
        case 2:
            mindmapOrganization();
            break;
        default:
            console.log('Errore');
    }
}

//funzione per eliminare le lable da un nodo scorrendo i figli, una volta eliminate rimetto 
//la posizione coretta dell'array booleano a false
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

function addLabel(vertex, pos) {
    var x = -1;
    var y = 0.5;

    if (graphOrientation == 1) {
        x = 0;
        y = -0.25;
    } else if (graphOrientation == 2) {

    }

    if (levelIsSetted[pos] == false) {
        var stringId = 'Level ' + (pos + 1);
        var label = graph.insertVertex(vertex, stringId, 'Level ' + (pos + 1), x, y, 0, 0, null, true);
        levelIsSetted[pos] = true;
    }
}

//funzione per cercare tutti i figli di un nodo
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

//funzione per cancellare un nodo e anche i suoi sotto figli se ne ha
function deleteNode(graph, cell) {
    // Salvo tutti i nodi figli di cell
    var children = getAllChildren(cell);
    // rimuovo tutti i figli
    graph.removeCells(children);
    //funzione per vedere quale label è stata cancellata e se è stata cancellata
    deleteChildrenHaveLabel(children, graph);
    //richiamo la funzione per riordianare il grafico dopo che il nodod è stato eliminato
    organizzationMethod(graphOrientation);
    return children;
}

//funzione per creare il file xml e permettere il download
function downloadFile() {
    var d = new Date();
    var encoder = new mxCodec();
    //creazione del file xml
    var node = encoder.encode(graph.getModel());
    var blob = new Blob([mxUtils.getPrettyXml(node)], { type: "text/plain;charset=utf-8" });
    //salvataggio del file xml (filesaver)
    saveAs(blob, d + ".xml");
}

//funzione per aprire il popup per l'export
function openForm() {
    location.href = "#popupexport";
}

/*function getFile(accepted) {
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
}*/

//funzione per l'upload e la visualizzazione dell'immagine sul server
function exportFileImage() {
    //prendiamo il file
    var file = document.getElementById("fileToUpload").files[0];
    var formData = new FormData();
    formData.append("fileToUpload", file);
    var xhttp = new XMLHttpRequest();
    //prendiamo l'immagine dal server
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var model = graph.getModel();
            //impostiamo lo stile
            var style = new Array();
            style[mxConstants.STYLE_IMAGE] = this.responseText;

            graph.stylesheet.putCellStyle(this.responseText, style);
            model.setStyle(cellImage, this.responseText);
            //ritorniamo nell'immagine principale
            location.href = "#";
        }
    };
    xhttp.open("POST", "upload.php", true);
    xhttp.send(formData);
}

//funzione per l'upload e la visualizzione del file xml sul server
function importXML() {
    //prendiamo il file
    var file = document.getElementById("fileToUploadXML").files[0];
    var formData = new FormData();
    formData.append("fileToUpload", file);
    var xhttp = new XMLHttpRequest();
    //prendiamo l'immagine dal server
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var xml = this.responseText;
            //importiamo il file xml
            var xmlDocument = mxUtils.parseXml(xml);
            var decoder = new mxCodec(xmlDocument);
            var node = xmlDocument.documentElement;
            decoder.decode(node, graph.getModel());
            var root = graph.getModel().getCell("2");
            var d = new Date();

            var cnt = 0;
            //impostiamo gli overlay nei nodi
            graph.traverse(root, true, function (vertex) {
                if (cnt == 0)
                    addFuntionButton(graph, vertex, false);
                else
                    addFuntionButton(graph, vertex, true);
                //Aggiungiamo i todo
                if (vertex.todo == "1") {
                    addTodo(graph, vertex);
                }
                cnt += 1;
            });
            graph.traverse(graph.getModel().getCell("1"), true, function (vertex) {
                var string = vertex.getStyle();

                try {
                    if (string.charAt() == "n") {
                        createStyleNote(graph, vertex, "note" + d);
                    }
                } catch (err) {
                }
            });
            location.href = "#";
        }
    };
    xhttp.open("POST", "reader.php", true);
    xhttp.send(formData);
}