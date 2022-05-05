<?php

class Mysql extends mysqli  {
  
  protected $result;
  private $transaction;
  public $notShowError=false;
  
  function __construct ($db="ayauho",$host='127.0.0.1',$login='ayauho',$password='') {
    if($host===true){
        $this->notShowError=true;
        $host='127.0.0.1';
    }     
    if(@strpos($_SERVER['SERVER_SOFTWARE'],"Ubuntu")||$_SERVER['LOGNAME']=='root') {
      $host="localhost";
    }
   
    @parent::__construct($host,$login,$password,$db);   
    if($this->connect_errno) {
      if(!$this->notShowError)printf("Connect failed: %s\n", $this->connect_error);
      exit;
    }
    if(!parent::set_charset("utf8mb4")&&!$this->notShowError)  // CP1251
      printf("Error loading character set utf8: %s\n", parent::error);
    $this->transaction = false;
  }
  
  function StartTransaction($name='_') {
    #mysqli_autocommit($this,false);
    mysqli_begin_transaction($this,0,$name);
    $this->transaction = true;
  }
  
  function SavePoint($id='a'){
    $this->Query("SAVEPOINT $id;");
  }
  function RollbackToSavePoint($id='a'){
    $this->Query("ROLLBACK TO SAVEPOINT $id;");
  }
  
  function _Rollback($name='_') {
    mysqli_rollback($this,0,$name);
    #mysqli_autocommit($this,true);
    $this->transaction = false;  
  }
  
  function _Commit($name='_') {
    mysqli_commit($this,0,$name);
    #mysqli_autocommit($this,true);
    $this->transaction = false;  
  }  
  
  # закрытие соединение
  function Close() {
    @parent::close();
  }

  # показ ошибки обращения
  function ShowError($query=null) {
    if($this->notShowError) return;
    if($query) 
      echo "WRONG QUERY: ".$query."\n <br>";
    echo $this->errno . ": " . $this->error . "\n <br>";
    if($this->transaction)
      $this->Rollback();
    return false;  
  }
  
  # простой запрос
  function Query($query,$echo=false)  {
    if($echo) echo $query."\n <br>";
    $this->result = parent::query($query);
    if($echo) var_dump($this->result);
    if(!$this->result)
      return $this->ShowError($query);
    return true;
  }
  
  function Q($query,$echo=false) {
    return $this->Query($query,$echo);  
  }
  
  # подготовка строки для БД
  function EscapeString(&$string) {
    $string = parent::real_escape_string($string);
    $string = str_replace("\\\\\\\\'","\\'",$string);
    $string = str_replace("\\\\\\\'","\\'",$string);
    $string = str_replace("\\\\\\'","\\'",$string);
    $string = str_replace("\\\\\'","\\'",$string);
    $string = str_replace("\\\\'","\\'",$string);
    $string = str_replace("\\\'","\\'",$string);  
    return $string;  
  }
  function Escape(&$string) {
    return $this->EscapeString($string);  
  }  
  /*
    1 тип аргументов: соответствие. Содержимое каждой переменной аргумента соответствует его названию $fields = 'id' или '*' или 'id,some_field1', $table = 'some_table'
    2 тип аргументов: массив. Только первый аргумент действует и он только массив, где ключи - названия частей запроса Array('table'=>'some_table','fields'=>'id'...)
    3 тип аругментов: строка. Только первый аргумент действует и он только полная строка запроса SELECT
  */
  function Select($fields,$table=null,$where=null,$order=null,$limit=null,$group=null,$echo=false)  { 
    $jsonEncode=false;
    $key = null;
    if( @is_array($fields) ) {
      $echo = @$fields['echo'];
      if(!$echo) $echo=$table;      
      $table = $fields['table'];
      $where = @$fields['where'];
      $order = @$fields['order'];
      $limit = @$fields['limit'];
      $group = @$fields['group'];
      if($fields['key']) $key = @(array)explode(',',$fields['key']);
      $jsonDecode = @$fields['jsonDecode'];
      if(is_string($jsonDecode)) $jsonDecode = explode(',',$jsonDecode);
      $returnZeroIndexArray = @$fields['returnZeroIndexArray']||!empty($key)?true:false;
      if($fields['fields']) $fields = @$fields['fields'];
      else $fields = '*';     
    } 
    if(is_string($fields) && is_string($table)) {
      $query= "SELECT $fields FROM $table";
      if($where) $query .=  " WHERE ($where)";
      if($order==='~') {
        $jsonDecode=true;
        $order='';
      }elseif($order&&$order!==true) $query .=  " ORDER BY $order";
      if($limit) $query .=  " LIMIT $limit";
      if($group) $query .=  " GROUP BY $group";

      if($order===true) $echo = true;
      if(is_array($order) && empty($order)) $returnZeroIndexArray=1;
      
    } else
    if(!$table||is_bool($table)||is_integer($table)||is_array($table)) {
      $fields_is_query=true;
      $query = $fields;
      if(is_array($table)) {
        $returnZeroIndexArray=1;
        if(isset($table['key'])) $key = @(array)explode(',',$table['key']);
        $jsonDecode = @$table['jsonDecode'];
        if(is_string($jsonDecode)) $jsonDecode = explode(',',$jsonDecode);
      } elseif(is_bool($table)) $echo = true;
    }                                        
    if($echo) echo $query."\n <br>";
    $this->result = parent::query($query);
    if(!$this->result) {
      return $this->ShowError($query);
    }
    $num = $this->result->num_rows;

    if($num == 0) return $table===[]||@$returnZeroIndexArray?[]:null;     
    elseif($num == 1) {
      $row = $this->result->fetch_assoc();
      if( count(explode( ",", $fields )) == 1 && $fields != "*" && @!$fields_is_query) { 
        $return = $row[$fields];                                    
      } elseif(@$fields_is_query && count($row)==1 ) {
        $return = $row[key($row)];    
      } else $return = $row;
      if($key) {
        $key_ = [];
        foreach($key as $k) {
            unset($return[$k]);
            $key_[] = $row[$k];
        }
        $return = [implode(' ',$key_)=>@$returnZeroIndexArray?[$return]:$return];
      }else if(@$returnZeroIndexArray) {        
         $return = [$return];
      }
    }                                                              
    elseif($num > 1) {                                                 
      $return = Array();                                           
      $i = 0;                                                      

     if( (count(explode(",", $fields )) > 1 || $fields == "*" && @!$fields_is_query) || @$fields_is_query ) {
       
       while($row = $this->result->fetch_assoc()) {      
         if($key) {
            $key_ = [];
            foreach($key as $k) $key_[] = $row[$k];
            $k = implode(' ',$key_);      
         } else $k=$i;
         if(count($row)>1) {
           foreach ($row as $name => $value){ 
             if(!$key||$key&&!in_array($name,$key))$return[$k][$name] = $value;
           }  
         } elseif(count($row)==1) {
           $return[$k] = $row[key($row)]; 
         }
         $i++;      
       }     
     } else {
       while($row = $this->result->fetch_assoc()) {
         $return[$i] = $row[$fields];
         $i++;
       }
     }
          
    }//if
    else return [];
    $this->result->close();
    if(@$fields_is_query&&$table&&empty($table)) {
      $this->zeroing_return($return);
    }
    if(@$jsonDecode) {
      if($num==1&&!is_array($return)) {
        $return = @(array)json_decode($return,1);
        if($return=='null') $return = [];
      } elseif($num>1||$num==1&&is_array($return)&&$returnZeroIndexArray) {
        foreach($return as $n=>$dat) {
          foreach($dat as $field=>$value) {
            if($jsonDecode===true||@in_array($field,$jsonDecode)) {
              $value = @(array)json_decode($value,1);
              if(json_last_error() == JSON_ERROR_NONE) $return[$n][$field] = $value;
            }            
          }
        }  
      } elseif($num==1&&is_array($return)) {
        foreach($return as $field=>$value) {
          if($jsonDecode===true||@in_array($field,$jsonDecode)) {
            $value = @(array)json_decode($value,1);
            if(json_last_error() == JSON_ERROR_NONE) $return[$field] = $value;
          } 
        }  
      }       
    }
    #if(!$return)$return=[];
    return $return;
  }//function
  
  function zeroing_return(&$return) {
    $return = @!$return[0]? [$return] : $return;    
  }

  function SelectQuery($fields,$table=null,$where=null,$order=null,$limit=null,$group=null,$echo=false) {
    return $this->Select($fields,$table,$where,$order,$limit,$group,$echo);
  }
  
  # вставка  
  function Insert($table,$fields,$values=null,$echo=false) {    
    if(@is_array($fields)) {
      $add = $values;
      $fields_array = [];      
      foreach($fields as $field=>$value) {
        if(!is_numeric($field)) $fields_array[] = $field;
        $values_array[] = $value;
      }
      $tableFields = " $table";
      if($fields_array) {
        $fields = implode(',',$fields_array);
        $tableFields = " $table($fields)"; 
      }
      foreach($values_array as $i=>$value) {
        #if(!is_numeric($value)) 
        $values .= "'$value'"; 
        #else $values .= "$value";  
        $values .= ',';
      }
      $values = trim($values,',');
    } else {
      $tableFields = " $table($fields)";
    }    
    $values = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $values);
    $query = "INSERT INTO$tableFields values($values)";
    if($echo) echo $query."\n <br>"; 
    $this->result = parent::query($query);
    if(!$this->result) {
       return $this->ShowError($query); 
    }   
    return true;
  }//function

  function InsertSimple($table) {
    $values = array_slice( func_get_args(), 1 );
    $this->Insert($table,$values);  
  }
  
  # обновление. Действуют 2 типа аргументов
  function Update($table,$fields=null,$values=null,$where=null,$echo=false) {
    
    if(@is_array($fields)) {
      $add = $values;
      $values = "";
      foreach($fields as $field=>$value) {
        $fields_array[] = $field;
        $values_array[] = $value;
      }
    } else {     
      $fields_array= explode(",",$fields);    
      $values_array= explode("','",trim($values,"'"));
    }
    #print_r($fields_array);
    #print_r($values_array);
    $updates = '';
    foreach ($fields_array as $i => $field)  {
      $updates .= "$field='$values_array[$i]'";
      if($i!=count($fields_array)-1)
        $updates.= ", ";        
    }
    
    $updates = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $updates);
    
    $query= "UPDATE $table SET $updates";
    
    if($where&&$where!='-') $query .=  " WHERE ($where)";
    elseif($where=='-') {} 
    else {
      echo "WHERE не определено. Возможно обновление ВСЕХ записей! Чтобы обновить все записи, определите 4-ый аргумент знаком - (минус)\n";
      return false;
    }
  
    if($echo)
      echo $query."\n <br>";   
    $this->result = parent::query($query);
    if(!$this->result)
       return $this->ShowError($query);     
    return true;
  }
  
  function Delete($table,$where=null,$echo=false) {
    $query= "DELETE FROM $table";
    if($where&&$where!='-') $query .=  " WHERE ($where)";
    elseif($where=='-') {} 
    else {
      echo "WHERE не определено. Возможно удаление ВСЕХ записей! Чтобы обновить все записи, определите 4-ый аргумент знаком - (минус)\n";
      return false;
    }    
    if($echo)
      echo $query."\n <br>";   
    $this->result = parent::query($query);
    if(!$this->result)
       return $this->ShowError($query);  
    return true;
  }//function
  
  
  function LastInsertId() {
    return $this->Select('select last_insert_id()');
  }     
  
}//class
?>
