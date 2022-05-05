<?
	$id = $F->Select('id','useraddresses',"address='$equityAddress'");
	if(!$id) $id = $F->Select('pId','smartcontractsvalues',"eId='22' AND value='$equityAddress'");
	$myId = $F->Select('id','useraddresses',"address='$myAddress'");
	if(in_array('limit',$get))$out['limit'] = $F->Select('*','marketorders',"pId=$PID AND status=1 AND orderId <> 0",[]);
	if(in_array('events',$get))$out['events'] = $F->Select("SELECT * FROM marketevents WHERE 
		(name='MarketOrder' AND (v3='$id' OR v4='$id')) OR
		(name='LimitOrderPut' AND (v4='$id' OR v5='$id')) OR
		(name='OrderExecuted' AND (v3='$id' OR v4='$id')) OR
		(name='LimitOrderCancel' AND (v4='$id' OR v5='$id')) 
			ORDER BY id DESC",[]);
	if(in_array('myOrders',$get))$out['myOrders']=$F->Select("SELECT * FROM marketorders WHERE pId=$PID AND byAddress='$myId' AND orderId <> 0 AND status=1 ORDER BY time DESC",[]);
	#$out['limitExecuted'] = $F->Select('*','marketorders',"pId=$PID AND status=0 AND `order`='1'");
	#$out['market'] = $F->Select('*','marketorders',"pId=$PID AND status=1 AND `order`='0'");


	echo je($out,JSON_NUMERIC_CHECK);
?>