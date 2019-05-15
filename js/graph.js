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
var editor;
var style;
var edgeStyle;
var cellImage;
var createCell;
var levelIsSetted = [false, false, false, false];
var graphOrientation = 0;
var graphStyle = 0;
var doc = mxUtils.createXmlDocument();
var fitIsActive;

var nodeColor;
var borderColor;
var edgeColor;

//funzione per la creazione/manipolazione del grafico 
function main(container) {
    // controllo se il broswer supporta MxGraph
    if (!mxClient.isBrowserSupported()) {
        // Messaggio di errore se non supportato
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
        graph.setTooltips(true);

        editor = new mxEditor(graph);
        editor.setGraphContainer(container);

        new mxCellTracker(graph, '#000000');

        //inizio finestrella in alto a sinistar
        var outline = document.getElementById('outlineContainer')

        var outln = new mxOutline(graph, outline);

        // Impostazione dello stile di default dei nodi
        style = graph.getStylesheet().getDefaultVertexStyle();
        setStyle(style, '#ffd700', '#db1818', '#ffa500');

        // Impostazione dello stile di default dei collegamenti ai nodi
        edgeStyle = graph.getStylesheet().getDefaultEdgeStyle();
        setEdgeStyle(edgeStyle, '#000000');

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
            var root = graph.insertVertex(parent, null, 'TITLE', (w / 2) - 100, 90, 5, 5, 'image=img/logo.png;');
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

        // Creazione di un popupmenu
        graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
            return createPopupMenu(editor, graph, menu, cell, evt);
        };
        // Aggiunta del handler per la tastiera
        var keyHandler = new mxKeyHandler(graph);

        //Aggiunta del nodo tramite tasto tab
        keyHandler.bindKey(9, function (_evt) {
            if (graph.isEnabled()) {
                addNode(graph, graph.getModel().getCell(graph.getSelectionCell().getId()));
            }
        });

        //Aggiunta del nodo tramite tasto enter
        keyHandler.bindKey(13, function (_evt) {
            if (graph.isEnabled()) {

                var parent = graph.getModel().getCell(graph.getSelectionCell().myparent);

                if (parent.getId() != 1) {
                    console.log(parent.getId());
                    addNode(graph, parent);
                }
            }
        });

        //Delete del nodo allo stesso livello di quello selezionato
        keyHandler.bindKey(46, function (_evt) {
            var parent = graph.getModel().getCell(graph.getSelectionCell().getId());
            if (graph.isEnabled()) {
                if (graph.getSelectionCell().getId() != 2) {
                    if (parent.style == "note") {
                        graph.getModel().remove(parent);
                    } else {
                        deleteNode(graph, parent);
                    }
                } else
                    alert("Non si può eliminare la root!");
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
            var preview = new mxPrintPreview(graph, scale, null, null, 0, 50, '#0000ff', 'MindMap Graph');
            //
            preview.insertBackgroundImage();
            //preview
            preview.print();
        }

        document.getElementById("note").onclick = function () {
            addNode(graph, graph.getDefaultParent());
            createStyleNote(graph, createCell, "note");
            graph.removeCellOverlays(createCell);
        }

        //edit manager
        var undoManager = new mxUndoManager();
        var listener = function (_sender, evt) {
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

        document.getElementById("show").onclick = function () {
            mxUtils.show(graph, null, 100, 100);
        };

        graph.dblClick = function (evt, cell) {
            checkLabel(cell);
        }
    }
}

function checkLabel(cell) {
    var newCellLabelValue = mxUtils.prompt('Choose new node label name:', null);
    if (newCellLabelValue.length > 25) {
        alert('Dimensione massima supearata (MAX 25 caratteri)');
    } else {
        graph.cellLabelChanged(cell, newCellLabelValue, true);
        organizzationMethod(graphOrientation);
    }
}

// funzione per fare il fit del grafico nel container
function fit() {
    var children = getAllChildren(graph.getDefaultParent().children[0]);
    if (children.length >= 6) {
        graph.fit();
        graph.view.rendering = true;
        graph.refresh();
    }
}

function allElementSelect() {
    graph.selectAll();
}

function allNodeSelect() {
    var children = getAllChildren(graph.getDefaultParent().children[0]);
    graph.selectCells(children);
}

function allEdgeSelect() {
    graph.selectEdges();
}

function changeEdgeStyle(value) {
    graph.getModel().beginUpdate();
    try {
        setEdgeStyle(edgeStyle, value);
    } finally {
        graph.getModel().endUpdate();
    }
}

function defaultStyleGraph() {
    graphStyle = 0;
    //imposto il colore per tutti i nodi del grafo
    changeStyle(setStyle(style, '#ffd700', '#db1818', '#ffa500'));
    //coloro il bordo dei nodi del livello 1 e livello 2
    changeNodeStyle('red', '#ffd700', '#ffa500');
    //metodo per cambiare il colore degli archi presenti sul grafo
    defaultEdgeStyle('#000000');
    //imposto il colore dei prossimi archi che si creano, in modo da avere gli archi 
    //dello stesso colore di quelli che ho già
    changeEdgeStyle('#000000');
}

function secondStyleGraph() {
    graphStyle = 1;
    //imposto il colore per tutti i nodi del grafo
    changeStyle(setStyle(style, '#808080', '#000000', '#808080'));
    //coloro il bordo dei nodi del livello 1 e livello 2
    changeNodeStyle('black', '#808080', '#808080');
    //metodo per cambiare il colore degli archi presenti sul grafo
    defaultEdgeStyle('#000000');
    //imposto il colore dei prossimi archi che si creano, in modo da avere gli archi 
    //dello stesso colore di quelli che ho già
    changeEdgeStyle('#000000');
}

function thirdStyleFunction() {
    graphStyle = 2;
    //imposto il colore per tutti i nodi del grafo
    changeStyle(setStyle(style, '#ffffff', '#000000', '#ffffff'));
    //coloro il bordo dei nodi del livello 1 e livello 2
    changeNodeStyle('black', '#ffffff', '#ffffff');
    //metodo per cambiare il colore degli archi presenti sul grafo
    defaultEdgeStyle('#000000');
    //imposto il colore dei prossimi archi che si creano, in modo da avere gli archi 
    //dello stesso colore di quelli che ho già
    changeEdgeStyle('#000000');
}

//controllo dei parametri inseriti per i colori, controllando che siano soltanto lettere e 
//non qualsiasi altro valore
function checkColor(colorArray) {
    var cnt = 0;
    for (var i = 0; i < colorArray.length; i++) {
        if (colorArray[i].length != 0) {
            if (controllInput(colorArray[i]) == false) {
                cnt++;
            }
        }
    }
    if (cnt == colorArray.length) {
        return true;
    }
    return false;
}

//funzione per impostare i parametri dello stile personale, a patto che il colore del nodo sia diverso da balck
//se il colore dell'arco e/o quello del bordo del nodo non vengono specificati di default si applica il colore balck.
//ritorna true se la scelta è valida, altrimenti false
function insertPersonalStyle() {
    var values = mxUtils.prompt('Insert the values of node, border, edge color:', null);
    var res = values.split(", ");
    if (checkColor(res)) {
        if (res.length == 3 && res[0] != 'black') {
            nodeColor = res[0];
            borderColor = res[1];
            edgeColor = res[2];
        } else if (res.length == 2 && res[0] != 'black') {
            nodeColor = res[0];
            borderColor = res[1];
            edgeColor = 'black';
        } else if (res[0] != 'black') {
            console.log('entro');
            nodeColor = res[0];
            borderColor = 'black';
            edgeColor = 'black';
        } else {
            nodeColor = 'white';
            borderColor = 'black';
            edgeColor = 'black';
        }
        return true;
    } else {
        alert('Errore valore di input non permesso (solo lettere)');
        return false;
    }
}


function personalStyleInputControll() {
    if (nodeColor == null && borderColor == null && edgeColor == null) {
        return insertPersonalStyle();
    }
    return true;
}
// impostiamo il nostro stile personale
function personalStyleFunction() {
    graphStyle = 3;
    if (personalStyleInputControll()) {
        //imposto il colore per tutti i nodi del grafo
        changeStyle(setStyle(style, nodeColor, '#000000', nodeColor));
        //coloro il bordo dei nodi del livello 1 e livello 2
        changeNodeStyle(borderColor, nodeColor, nodeColor);
        //metodo per cambiare il colore degli archi presenti sul grafo
        defaultEdgeStyle(edgeColor);
        //imposto il colore dei prossimi archi che si creano, in modo da avere gli archi 
        //dello stesso colore di quelli che ho già
        changeEdgeStyle(edgeColor);
    }
}

//funzione per ripristinare il clore originario di un arco OK
function defaultEdgeStyle(newStyle) {
    var children = getAllChildren(graph.getDefaultParent().children[0]);
    if (children.length > 1) {
        for (var i = 0; i < children.length; i++) {
            if (children[i].edges != 0) {
                var edges = children[i].edges;
                for (var j = 0; j < edges.length; j++) {
                    edges[j].style = 'strokeColor=' + newStyle + ';';
                }
            }
        }
    }
    graph.refresh();
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

//funzione per cambiare il colore del bordo di un singolo nodo OK
function changeNodeStyle(value1, value2, value3) {
    graph.getModel().beginUpdate();
    try {
        var children = getAllChildren(graph.getDefaultParent().children[0]);
        var stylesheet;
        if (children != null) {
            for (var i = 0; i < children.length; i++) {
                var n = children[i].style.indexOf(";");
                var nodeSubStyle = children[i].style.substring(0, n + 1);
                stylesheet = nodeSubStyle + 'gradientColor=' + value2 + ';' + 'fillColor=' + value3 + ';';
                if (children[i].myId == 0 || children[i].myId == 1) {
                    children[i].style = stylesheet + 'strokeColor=' + value1 + ';';
                } else {
                    children[i].style = stylesheet + 'strokeColor=' + value2 + ';';
                }
            }
        }
    } finally {
        graph.getModel().endUpdate();
        graph.refresh();
    }
}

//funzione per cambiare il colore del contorno di un nodo OK
function changeBorderColor(cell, value1, value2, value3, value4) {
    var stylesheet = cell.style;
    if (graphStyle == 0) {
        cell.style = stylesheet + ';strokeColor=' + value1 + ';';
    } else if (graphStyle == 1) {
        cell.style = stylesheet + ';strokeColor=' + value2 + ';';
    } else if (graphStyle == 2) {
        cell.style = stylesheet + ';strokeColor=' + value3 + ';';
    } else if (graphStyle == 3) {
        cell.style = stylesheet + ';strokeColor=' + value4 + ';';
    }
}

//funzione per il colore dei bordi dei nodi
function borderColorAddNode(cell) {
    if (cell.myId == 1) {
        changeBorderColor(cell, '#db1818', '#000000', '#000000', borderColor);
    } else {
        changeBorderColor(cell, '#ffd700', '#808080', '#ffffff', nodeColor);
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

//funzione per definire lo stile dei nodi del grafico
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
    layout.nodeDistance = 50;
    layout.execute(graph.getDefaultParent());
    fitIsActive = document.getElementById('checkBox').checked;
    if (fitIsActive)
        fit();

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
    layout.nodeDistance = 50;
    layout.execute(graph.getDefaultParent())
    fitIsActive = document.getElementById('checkBox').checked;
    if (fitIsActive)
        fit();

}

//funzione per l'ordinamento delle grafico in modo mindmap
// e sistemazione delle label nel posto giusto
function mindmapOrganization() {
    graphOrientation = 2;
    var organic = new mxFastOrganicLayout(graph);
    organic.forceConstant = 120;
    organic.execute(graph.getDefaultParent());
    fitIsActive = document.getElementById('checkBox').checked;
    if (fitIsActive)
        fit();
}

// funzione per la creazione del popupmenu alla pressione del tasto destro
function createPopupMenu(editor, graph, menu, cell, _evt) {
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

            menu.addItem('Add Node', 'images/plus.png', function () {
                var cell = graph.getSelectionCell();
                addNode(graph, cell);
            });

            menu.addItem('Delete Node', 'images/error.gif', function () {
                var cell = graph.getSelectionCell();
                if (cell.id != 2)
                    deleteNode(graph, cell);
                else
                    alert('Il nodo principale non può essere eliminata!');
            });

            menu.addSeparator();

            //cambiare il colore del nodo
            menu.addItem('Change node color', 'images/color.png', function () {
                var cell = graph.getSelectionCell();
                if (cell != null) {
                    var stylesheet = cell.style;
                    var newStyle = mxUtils.prompt('Choose new node color(English name):', null);
                    if (newStyle != null)
                        if (controllInput(newStyle)) {
                            alert('Sono permesse solo lettere!');
                        } else {
                            if (stylesheet.includes("strokeColor")) {
                                var res = stylesheet.split(";");
                                var strokeColor;
                                for (var i = 0; i < res.length; i++) {
                                    if (res[i].includes("strokeColor"))
                                        strokeColor = res[i];
                                }
                                cell.style = res[0] + ';gradientColor=' + newStyle + ';' + 'fillColor=' + newStyle + ';' + strokeColor + ';';
                            } else
                                cell.style = stylesheet + 'gradientColor=' + newStyle + ';' + 'fillColor=' + newStyle + ';';
                            graph.refresh();
                        }
                }
            });

            //cambiare il colore del bordo del nodo
            menu.addItem('Change border color', 'images/color.png', function () {
                var cell = graph.getSelectionCell();
                if (cell != null) {
                    var stylesheet = cell.style;
                    var newStyle = mxUtils.prompt('Choose new border color(English name):', null);
                    if (newStyle != null)
                        if (controllInput(newStyle)) {
                            alert('Sono permesse solo lettere!');
                        } else {
                            console.log(stylesheet);
                            if (stylesheet.includes("strokeColor")) {
                                var res = stylesheet.split("strokeColor=");
                                cell.style = res[0] + 'strokeColor=' + newStyle + ';';
                            } else
                                cell.style = stylesheet + 'strokeColor=' + newStyle + ';';
                            console.log(cell.style);
                            graph.refresh();
                        }
                }
            });

            //cambiare il colore di tutti gli archi di quel nodo
            menu.addItem('Change edges color', 'images/color.png', function () {
                var edges = graph.getSelectionCell().edges;
                if (edges != null) {
                    var newStyle = mxUtils.prompt('Choose new edges color(English name):', null);
                    if (newStyle != null)
                        if (controllInput(newStyle)) {
                            alert('Sono permesse solo lettere!');
                        } else {
                            for (var i = 0; i < edges.length; i++) {
                                edges[i].style = 'strokeColor=' + newStyle + ';';
                            }
                            graph.refresh();
                        }
                }
            });

            //per selezionare il colore dello stile personale
            menu.addItem('Select personal style', 'images/color.png', function () {
                insertPersonalStyle();
            });


            menu.addSeparator();

            menu.addItem('Edit label', 'img/pencil.png', function () {
                checkLabel(cell);
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


//funzione per controllare la sringa di input per il nome del colore
function controllInput(input) {
    if (!/^[a-zA-Z]*$/g.test(input))
        return true;
    return false;
}


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

    //colore dello sfondo del nodo
    style[mxConstants.STYLE_GRADIENTCOLOR] = value1;
    //colore del bordo del nodo
    style[mxConstants.STYLE_STROKECOLOR] = value2;
    //colore main parte del nodo
    style[mxConstants.STYLE_FILLCOLOR] = value3;

    //dimensione del bordo del nodo
    style[mxConstants.STYLE_STROKEWIDTH] = 4;

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

//funzione per il impostare il colore didefault degli archi
function setEdgeStyle(style, value) {
    style[mxConstants.STYLE_STROKEWIDTH] = 3;
    style[mxConstants.STYLE_STROKECOLOR] = value;
}

//funzione per poter visualizzare il pulsante elimina e aggiungi nodo
function addFuntionButton(graph, cell, flagDelete) {
    var addOverlay = new mxCellOverlay(new mxImage('img/add.png', 20, 20), 'Add');
    addOverlay.cursor = 'hand';
    addOverlay.align = mxConstants.ALIGN_CENTER;
    addOverlay.verticalAlign = mxConstants.ALIGN_BOTTOM;
    graph.addCellOverlay(cell, addOverlay);
    addOverlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (_sender, _evt) {
        addNode(graph, cell);
    }));
    //se non è il primo allora metti il flag per poterlo cancellare
    if (flagDelete) {
        var deleteOverlay = new mxCellOverlay(new mxImage('img/delete.png', 20, 20), 'Add');
        deleteOverlay.cursor = 'hand';
        deleteOverlay.align = mxConstants.ALIGN_RIGHT;
        deleteOverlay.verticalAlign = mxConstants.ALIGN_TOP;
        graph.addCellOverlay(cell, deleteOverlay);
        deleteOverlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (_sender, _evt) {
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
                vertex.myId = cell.myId + 1;
        }
        vertex.todo = 0;
        vertex.myparent = cell.getId();
        //per lo stile del bordo del nodo che devo creare
        borderColorAddNode(vertex);
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
function deleteChildrenHaveLabel(children, _graph) {
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
// funziona per l'aggiunta di label
function addLabel(vertex, pos) {
    var x = -1;
    var y = 0.5;

    if (graphOrientation == 1) {
        x = 0;
        y = -0.25;
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
            //var style = new Array();
            //style[mxConstants.STYLE_IMAGE] = this.responseText;

            var cell = graph.getSelectionCell();
            if (cell != null) {
                var stylesheet = cell.style;
                var n = stylesheet.indexOf(";");
                var res = stylesheet.substring(n + 1, stylesheet.length);
                cell.style = 'image=' + this.responseText + ';' + res;
                graph.refresh();
            }

            //graph.stylesheet.putCellStyle(this.responseText, style);
            //model.setStyle(cellImage, this.responseText);
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
    organizzationMethod(graphOrientation);
}