<? #$test = 1;
date_default_timezone_set('UTC');
include('Classes/Mysqli.php');
include('functions/library.php');
$GLOBALS['lang']='en';
$root=$_SERVER['CONTEXT_DOCUMENT_ROOT'];
if(strpos($root,'fundaria-test'))$test=true;
$F = new Mysql('fundariatest');
#echo $_POST['json'];
if($_POST['json']) $_POST=json_decode($_POST['json'],1);
#print_r($_POST);
deepEscape($_POST);
extract($_POST);
$SID = checkStakeholder($F,$SID,$key,$back);
if(!$SID)die('null');
if(in_array($act,[''])){ 
    include('Common.php');
    $C=new Common($F,$PID);   
}
if(in_array($act,[''])){
    include_once('Classes/UserData.php');  
    $UD=new UserData($F,$SID);    
}
include($root."php/Market/$act.php");
$F->Close();

?>