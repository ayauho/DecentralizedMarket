<?
	$out['lastChange'] = $F->Select("SELECT price FROM marketorders WHERE pId=$PID AND orderId=0 ORDER BY id DESC LIMIT 0,2",[]);

	echo je($out);
?>