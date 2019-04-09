<?php

/*****************************************************
 * Nome: upload.php
 * 
 * Autori: J. De Boni, G. Zorloni  
 * 
 * Descrizione: Tramite questo programma si può
 * salvare nel proprio server le immagini e ritorna
 * il percorso sul server
 * 
 ******************************************************/

$target_dir = "uploads/";
date_default_timezone_set(date_default_timezone_get());
$date = date('m-d-Y-h-i-s', time());
$uploadOk = 1;
$imageFileType = strtolower(pathinfo(basename($_FILES["fileToUpload"]["name"]),PATHINFO_EXTENSION));
$target_file = $target_dir .$date.".".$imageFileType;

// controllo se il file già esiste
if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    $uploadOk = 0;
}
// controllo la dimensione del file
if ($_FILES["fileToUpload"]["size"] > 500000) {
    echo "Sorry, your file is too large.";
    $uploadOk = 0;
}

// controllo se $uploadOk è impostato su 0 quindi produce un errore
if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.";
// se tutto è corretto, prova a fare upload
} else {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {

        echo $target_file;
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}
?>