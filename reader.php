<?php

$target_dir = "uploads/";
date_default_timezone_set(date_default_timezone_get());
$date = date('m-d-Y-h-i-s', time());
$uploadOk = 1;
$imageFileType = strtolower(pathinfo(basename($_FILES["fileToUpload"]["name"]),PATHINFO_EXTENSION));
$target_file = $target_dir .$date.".".$imageFileType;

// Check if file already exists
if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    $uploadOk = 0;
}
// Check file size
if ($_FILES["fileToUpload"]["size"] > 500000) {
    echo "Sorry, your file is too large.";
    $uploadOk = 0;
}

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    echo "Sorry, your file was not uploaded.";
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
        $myfile = fopen($target_file, "r") or die("Unable to open file!");
        echo fread($myfile,filesize($target_file));
        fclose($myfile);
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}
?>