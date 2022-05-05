<?
	$myId = $F->Select('id','useraddresses',"address='$myAddress'");
	if($what=='deposit')$name='Deposited';
	else $name='Withdrawn';
	if($block) $andBlock = " AND block=$block";
	$data = $F->Select("SELECT * FROM marketevents WHERE name='$name' AND v1='$myId' $andBlock ORDER BY block DESC",[]);

	echo je($data);	
?>