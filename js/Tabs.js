import { Helper } from '/test/js/Helper.js'
import { __ } from '/test/js/__.js'
export class Tabs extends Helper {
  
  constructor(data) {
    super()
    let _=this,simple=data.simple
    _.ids = []
    _.names = [] 
    _.maxHeight = 30
    _.css = {}
    _.tabsClass = 'tabs'
    _.tabsSel = '.'+_.tabsClass
    _.bgActive = simple?'#fff':'#efefef'
    _.bgPassive = simple?'#fff':'#ddd'
    _.colorPassive = simple?'#000':'#999'
    _.cntrBg = 'white'
    _.fontSize = '.8em'
    _.padding = '0 25px'
    _.css['.tabs'] = {}
    _.css['.tabs li'] = {}   
    Object.assign(_, data)
        
    _.cntrSel = typeof _.$cntr=='string'? _.$cntr : _.$cntr.localName+(_.$cntr.id&&'#'+_.$cntr.id)+(_.$cntr.className&&'.'+_.$cntr.className)        
    _.css.cntrSel=_.cntrSel
   _.$cntr = _.$(_.$cntr)
   let pos=_.$cntr.css('position')
   if(!['static','absolute'].includes(pos))_.$cntr.css('position','relative')
   _.$tabs = _.$({cl:_.tabsClass+' noselect'},'ul').to(_.$cntr)
   if(_.id)_.$tabs.id = _.id 
   if(simple)_.$tabs.acl('simple') 
    _.firstTimeClicked = true
    data.click && (_.clickCallback = _.click)
    //_.$cntr.css({background:_.cntrBg,margin:0,padding:0,'max-height':_.maxHeight+'px',overflow:'hidden'})
    _.$tabs.css({'max-height': _.maxHeight+1+'px','padding-right': '20px','padding-left': simple?'10px':'20px'})      
/*
    _.css['.tabs li.active:before'] = {
      'border-color': 'transparent '+_.bgActive+' transparent transparent'
    }    
    _.css['.tabs li.active:after']= {
      'border-color': 'transparent transparent transparent '+_.bgActive
    } 
    
    _.css['.tabs li:before'] = {
      'border-color': 'transparent '+_.bgPassive+' transparent transparent'    
    } 
    _.css['.tabs li:after'] = {
      'border-color': 'transparent transparent transparent '+_.bgPassive      
    }         
*/    
    //_.list.reverse()
 
    _.implementCss(_.css)
    let size=_.maxHeight/1.5,marginTop=_.maxHeight/2-size/2
    let rollerCss = {'border-radius':'50%',width:size+'px',height:size+'px','top':marginTop+'px',
      background:_.bgActive,position:'absolute','line-height':size+'px','text-align':'center',
      'box-shadow':'0px 1px 5px rgba(0,0,0,.5)',cursor:'pointer',cursor:'hand','font-size':size/1.5+'px',display:'none','z-index':3}
    _.$leftRoller = _.$({cl:'roller left noselect hand'},'tabs-roller').css(rollerCss)
      .html('&#9668;')
      .to(_.$cntr)
    //log(_.cntrWidth)
    _.$rightRoller = _.$({cl:'roller right noselect hand'},'tabs-roller').css(rollerCss).css({right:0})
      .html('&#9658;')
      .to(_.$cntr)      
    
    for(let i in _.list) {
      _.add(_.list[i], false) 
    }    
    _.eventsListeners()
  }
  
  isHidden($tab) {
    return $tab.css('display') == 'none'||$tab.offsetTop>this.maxHeight?true:false
  } 
  
  add(tab, _new=true, index=false) {
    let _=this, $li, $a, id
    id = tab.id || ''
    id = id.toString()
    $li = _.$({id},'li').attr(tab.attr||{}).css({background: _.bgPassive,'margin-right':'-10px','margin-left':'-10px',padding: _.padding,'max-width':_.maxWidth||'auto'})
    $a = _.$({},'span').to($li).html(tab.name).css({color: _.colorPassive,'font-family': _.fontFamily||'Arial, sans-serif','font-size':_.fontSize,'height':_.maxHeight+'px !important'})
    if(tab.$and) tab.$and.to($li)
    if(index!=false) {
      _.ids.splice(index,0,id)
      _.names.splice(index,0,tab.name)      
    } else {
      _.ids.push(id)
      _.names.push(tab.name)
    } 
    _.$tabs.$li = _.$tabs.chi()
    if(_new) {
      if(index!=false) _.list.splice(index,0,tab)
      else _.list.push(tab)
    }
                               
    if(index!=false) {
      _.$tabs.$li.eq(index).length && $li.insertBefore( _.$tabs.$li.eq(index).show() ).show() ||
        $li.insertAfter( _.$tabs.$li.eq(index-1).show() ).show()
    }
    else {
      _.$tabs.append($li)    
    }
    _.$tabs.$li = _.$tabs.chi()
    _.$lastAdded = $li
    $li.ev('click', e=>{     
      let $el = _.$(e.currentTarget)
      //log('active',$el)      
      _.setActive($el)     
      _.clickCallback($el,this,_.firstTimeClicked)      
      _.firstTimeClicked=false
    })
    //log(_.$tabs.$li)
    if(_.tabsWidth>this.$cntr.offsetWidth) { 
      _.$rightRoller.show()  
    }    
    return this
  }
  
  setActive(name=null, id=null, attr=null, click=false) {
    if(id) id = ''+id
    let _=this, $tab = this.getTab(name, id, attr)      
    if($tab) {
      _.foreach(this.$tabs.$li,$li=> {
          $li.rcl('active').css({background:_.bgPassive})        
      })
      if( 'colorPassive' in this ) {
        _.foreach(this.$tabs.$li,$li=> $li.find('span').css('color', this.colorPassive))
      }
      $tab.acl('active').css({background : _.bgActive}) 
      this.activeId = $tab.id
      this.activeName = $tab.find('span').txt()
      if( 'colorActive' in this ) {
        $tab.find('span').css('color', this.colorActive)  
      }
      this.$active = $tab
    } else return false
    if(click) $tab.click()
  }
  
  getTab(name=null, id=null, attr=null) {
    let _=this, $tab
    if(name===null&&!id) $tab = this.$lastAdded
    else if(name && typeof name=='object')  $tab = name
    else {
      let $el, hasAllAttr
      this.names.some((_name, i) => {
        hasAllAttr=true
        $el = this.$tabs.$li[i]
        if(attr) {
          for(let nm in attr) {
            if($el.attr(nm)==attr[nm]) hasAllAttr=false
          }                    
        }
        //console.log(_name,name,id,this.ids[i],hasAllAttr)
        if(_name==name || id==this.ids[i] || attr&&hasAllAttr) {
          $tab = $el 
          return true
        } 
      })
    }
    return $tab || null  
  }
  
  remove(name, id=null, type=null) {
    let _=this, index 
    if(!(Number(name) === parseInt(name) && n % 1 === 0)) {
      let $tab = this.getTab(name, id, type)
      index = $tab.indx()
    } else index = this.names.indexOf(name)
//    console.log('removing', index)    
    this.ids.splice(index,1)
    this.names.splice(index,1)
    this.list.splice(index,1)
    this.$tabs.$li[index].rm()
    this.$tabs.$li.splice(index,1)
    let stopShow=false, showedIndexes = []

    this.$tabs.$li.some(( $el, i )=> {
      if(!this.isHidden($el) ) {
        showedIndexes.push(i)
      }
    })
    let max = Math.max.apply(null, showedIndexes), min = Math.min.apply(null, showedIndexes)           

    if(max=this.$tabs.$li.length-1) this.$rightRoller.hide()    
    if(min==0) this.$leftRoller.hide()       
          
  }
  
  estimateWidth($el) {
    let _=this, width=0, $div, $clone = $el.clone(), mr=0, ml=0
    $div = _.$({}).css({position:'absolute'}).to(_.$body)
    $clone.to($div)
    if(this.$tabs.$li[0]){
        mr=this.$tabs.$li[0].cssValue('margin-right')
        ml=this.$tabs.$li[0].cssValue('margin-left')    
    }
    width=$div.marginWidth()-mr-ml
    $div.rm()
    return width
  }
  
  get cntrWidth() {
    return this.$cntr.offsetWidth-this.$tabs.cssValue('padding-left')-this.$tabs.cssValue('padding-right')
  } 
  
  get tabsWidth() {  
    let _=this,s=0
    _.foreach(this.$tabs.$li,$li=> {
        s+=$li.find('span').offsetWidth+36
    })
    return s
  }
  
  get showedTabsWidth() {
    let _ = this
    return this.$tabs.$li.map($li=>{ 
      return !_.isHidden($li)? $li.offsetWidth-$li.offsetWidth/5 : 0 
    }).reduce((a, b) => a + b, 0) || 0
  }  
  
  rollRight() {
    let _=this, firstHidden=false, showedNum
    _.$tabs.$li.some(( $li, i )=> {    
      if(!firstHidden && !_.isHidden( $li ) ) {
        firstHidden=true
        $li.hide()
        //log(i,'!firstHidden')
        //showedNum = i+1        
      } else if(firstHidden) {        
        _.$leftRoller.show()
        //log(i,'firstHidden')
        if($li.offsetTop<_.maxHeight) showedNum = i               
      }      
    })
    //log(showedNum)   
    if(showedNum == _.$tabs.$li.length-1) _.$rightRoller.hide()
  }
  
  rollLeft() {    
    let _=this, firstHidden=false, showedNum, $lis=[]
    _.ech(_.$tabs.$li,$li=> $lis.push($li) )
    $lis.reverse().some(( $li, i )=> {
      if(!firstHidden && !_.isHidden( $li ) ) { 
        _.$rightRoller.show()
        //_.$tabs.$li[_.$tabs.$li.length-i-1].hide()        
        firstHidden = true        
      } else if( firstHidden && _.isHidden( $li ) ) {
        showedNum = _.$tabs.$li.length-i-1       
        _.$tabs.$li[showedNum].show()
        return true        
      }      
    })    
    if(showedNum===0) {
      _.$leftRoller.hide()
    }
  }  
  
  eventsListeners() {
    let _=this  
    _.$leftRoller.ev('click', e=> this.rollLeft())
    _.$rightRoller.ev('click', e=> this.rollRight())          
  }
  
  click(clickCallback) {
    this.clickCallback = clickCallback
    if('active' in this) {
        this.$tabs.$li[this.active-1].click()        
    }   
  }
  clickCallback($tab) {}
  
  test(go=false) {
    if(!go) return
    for(let i=0;i<12;i++) {
      this.add({
        name: 'hel'+i
      })              
    }
    //this.rollRight()
    this.rollRight()
  }
    
}