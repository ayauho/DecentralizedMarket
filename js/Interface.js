import { Helper } from '/js/Helper.js'
import { ScrollBar } from '/js/ScrollBar.js'
export class Interface extends Helper{
    constructor(){
        super()
        let _=this     
        _.bubBC='#AAACBF'
        _.bubPS=8
        _.bubP='5px'
        _.bubBR=8
        _.listIP='3px 5px !important'
        _.listBg='#D4D5DF'
        _.bubZindex=999
        _.nroc=new Set()
        if(!window.hiddenBubbles)window.hiddenBubbles=new Set()
        _.removeBubblesEvent()
        _.bubbles= new Map()       
        _.id=new Date()
        _.counts={horScrollList:0}
        _.waitIcon='/images/icons/ui/wait.gif'
    }
    removeBubblesEvent(){
        let _=this
        if(window.removeBubblesEventSet) return
        let f=e=>{            
            let $e=e.target.$||_.$(e.target)
            if(!($e&&$e.prnt('bubble'))&&!_.nroc.has($e)) _.foreach(_.$body.find('bubble'),$bub=>{                
                if(!_.nroc.has($bub.$)&&!window.hiddenBubbles.has($bub.$_)) $bub.rmv()
                else if(!_.nroc.has($bub.$)) $bub.css('visibility','hidden')
            }, true)
        }
        let ev='click'
        document.removeEventListener(ev,f)
        document.addEventListener(ev,f)
        window.removeBubblesEventSet=true
    }
    removeBubbles(){
        let _=this
        _.foreach(_.$body.find('bubble'),$b=>{
            if(!_.nroc.has($b.$)&&!window.hiddenBubbles.has($b.$)) $b.rmv()
        },true)
    }
    notRemoveOnClick($e){
        let _=this
        if(!_.nroc.has($e)) _.nroc.add($e)   
    }
    distToPageTop(e){ return e.getBoundingClientRect().top+window.scrollY-this.$body.cssValue('top')} 
    distToTop(e){ return e.getBoundingClientRect().top}    
    distToBot(e){ return this.winHeight-this.distToTop(e)-e.offsetHeight-this.$body.cssValue('top')}
    distToLeft(e,pure=false){return e.getBoundingClientRect().left-(!pure?this.$body.cssValue('left'):0)}
    distToRight(e){ return this.winWidth-this.distToLeft(e)-e.offsetWidth}
    hover($e,clb1,clb2){
        $e.addEventListener('mouseover',e=>clb1(this.$(e.currentTarget)))
        $e.addEventListener('mouseout',e=>clb2(this.$(e.currentTarget)))
    }
    bubble(d){ 
        let _=this,pointer
        if(d.style){
            pointer=d.pointer?'pointer':'mouse'
            let assoc={hover:_.sS?pointer+'down':pointer+'enter',click:'click'},event =assoc[d.style] 
            if(!d.evented){
                d.$c.addEventListener(event,e=> { 
                    if('undefined' != typeof $&&$.ScrollMenu&&$.ScrollMenu.jumping)return
                        Object.assign(d,{evented:true})
                        _.bubble(d)
                        d.click&&d.click()
                })
                if(d.appearNow)d.$c.trigger(event) 
                return
            } 
        }       
        let bubId=d.id||''+d.$c.uid+(d.x||'')
        if(_.bubbles.has(bubId)){
            _.bubbles.get(bubId).rmv()
            _.bubbles.delete(bubId)   
        }        
        let $c=d.$c,$cnt=d.$cnt,$b,$p,ct=_.distToPageTop($c),cl=_.distToLeft($c),ch=$c.offsetHeight,dir,w,h,fs=d.fs||'100%',fc=d.fc||'black',bc=d.bg||_.bubBC,l,dif,className=d.className||''
        let hoverTO,htoDelay=d.htoDelay||d.delay||1000,zIndex=d.zIndex||0,$imgs,imgsLoadedCount=0,cntHeight 
        let posYLag=d.posYLag||0,xLag=d.xLag||0,$ta        
        if(d.type&&d.type.substr(0,'info'.length)=='info'){
          fc='white'          
          fs='90%'        
          if(d.type=='info') bc='black'
          if(d.type=='info2') bc='#555'      
        }
        if(d.type=='warning'){
          fc='white'          
          fs='120%'
          bc='red'             
        }
        if(d.type=='success'){
          fc='white'          
          fs='120%'
          bc='green'             
        }        
        if(!d.orient)d.orient='ud'
        //log('$ct=',$c)
        _.notRemoveOnClick($c)
        if(d.cnt) $cnt=_.$({},'tip').css({'font-size':'80%',overflow:'hidden'}).html(d.cnt)        
        $cnt&&(cntHeight=$cnt.css('height'))&&($imgs=$cnt.find('img'))      
        $b=_.$({cl:className},'bubble').css({position:'absolute','z-index':_.bubZindex+zIndex,padding:d.padding||_.bubP,'font-size':fs,background:bc,color:fc,'border-radius':d.br||_.bubBR+'px','box-shadow':'0 0 2px lightgrey'}).to(_.$body)
        _.bubbles.set(bubId,$b)
        $b.$c=$c
        !_.isEmpty($imgs)&&$b.css({visibility:'hidden'})
        let $t
        if(d.title) {
            $t=_.$({},'title').css({padding:'3px 0',width:'100%'}).html(d.title).to($b)
            if(!$cnt.css('height')){
                cntHeight=`calc(100% - ${$t.offsetHeight}px)`
                $cnt.css({height:cntHeight})
            }
        }        
        //if(d.id) _.bubbles[d.id]=$b
        if(d.width) $b.css({width:d.width+'px'})
        if(d.height) {
            $b.css({height:d.height+'px'})
            if(!cntHeight)$cnt.css({height:'100%',overflow:'hidden'})                        
        }
        if(d.maxWidth) $b.css({'max-width':d.maxWidth+'px'})
        $p=_.$({},'pointer').css({position:'absolute',border:_.bubPS+'px solid transparent',width:'1px',height:'1px'}).to($b)
        if($cnt){
            $cnt.to($b)
            $b.$cnt=$cnt
        }                      
        ;($b.correctPosition=(touchscreen=false)=>{       
          let ct=_.distToPageTop($c),cl=_.distToLeft($c),nh,overtop,$cnt=$b.$cnt         
          if(!touchscreen){
            w=$b.offsetWidth,h=$b.offsetHeight          
            if(['ud','u','d'].includes(d.orient)){
              if(w>_.winWidth) $b.css({width:_.winWidth+'px'})            
              dir=d.orient 
              if(dir=='ud') dir=_.distToTop($c)>_.distToBot($c)?'u':'d'         
              $b.css({left:0})
              h=$b.offsetHeight,w=$b.offsetWidth                    
              $b.css({left: (d.x||_.distToLeft($c)+xLag+$c.offsetWidth/2)-$b.offsetWidth/2+'px' })
              h=$b.offsetHeight,w=$b.offsetWidth          
              if(dir=='u'){                        
                if(h>(nh=ct-_.bubPS)) {
                  //$cnt?.css({height:cntHeight})
                  $cnt&&$cnt.css({height:cntHeight})                 
                  $b.css({top:0,height:nh-_.bubPS+'px'})
                  //$cnt?.css({'overflow-y':'scroll'})
                  $cnt&&$cnt.css({'overflow-y':'scroll'})
                } else {
                    h=$b.offsetHeight
                    $b.css({top:ct-h-_.bubPS+posYLag+'px'})
                }
                //log(ct,h,posYLag,ct-h-_.bubPS+posYLag)            
                $p.css({'border-top-color':bc,'border-bottom':0,bottom:-_.bubPS+'px'})
              }else{
                if(h>(nh=_.distToBot($c)-_.bubPS)) {
                  //$cnt?.css({height:cntHeight})
                  $cnt&&$cnt.css({height:cntHeight})
                  $b.css({height:nh+'px'})
                  //log(nh)
                  //$cnt?.css({'overflow-y':'scroll'})                                
                  $cnt&&$cnt.css({'overflow-y':'scroll'})
                }
                $b.css({top:ct+ch+_.bubPS+posYLag+'px'})
                $p.css({'border-bottom-color':bc,'border-top':0,top:-_.bubPS+'px'})  
              }
              //$p.css({left:(d.x||_.distToLeft($c))+$c.offsetWidth/2-$b.cssValue('left')-_.bubPS+'px' })
              //$p.css('left', _.distToLeft($c)-_.distToLeft($b)+'px' )
            }
            if(d.orient=='l'){
                _.bubPS=5
                if(h>_.winHeight) $b.css({height:_.winHeight+'px'})
                //$b.css({top:0})
                h=$b.offsetHeight,w=$b.offsetWidth
                $b.css({top: (d.y||_.distToTop($c)+$c.offsetHeight/2)-$b.offsetHeight/2+'px' })
                $b.css({left:cl-_.bubPS-$b.offsetWidth+'px'})
                $p.css({right:-_.bubPS+'px',top:ct+$c.offsetHeight/2-$b.cssValue('top')-_.bubPS+'px'})
                $p.css({'border-left-color':bc,'border-right':0})       
            }
          }else{
            _.$body.css('position','realtive')
            $b.css({width:_.winWidth+'px',height:(_.winWidth>_.winHeight?_.winHeight-200:_.winHeight-265)+'px',left:-_.$body.cssValue('left'),top:_.$body.scrollTop})
            $cnt.css({width:'auto',height:$b.offsetHeight - $b.cssValue('padding-top') - $b.cssValue('padding-bottom')  - ($t&&$t.offsetHeight||0)+'px' })
            if($cnt&&$cnt.hcl('textarea')){
                let h=0
                $cnt.chi($chi=>{
                     if($chi.localName!='textarea')h+=$chi.offsetHeight 
                })
                $cnt.find('textarea').css('height',`calc(100% - ${h}px)`)
            }
            $p.hide()
          }        
          if(['ud','u','d'].includes(d.orient)){        
            let pLeft,bl=_.distToLeft($b),cw=$c.offsetWidth,bw=$b.offsetWidth
            if(d.x) pLeft=$b.offsetWidth/2-_.bubPS
            else if(cl>bl&&bl+bw>cl+cw) pLeft=_.distToLeft($c)-_.distToLeft($b)+cw/2-_.bubPS 
            //else if(cl<bl&&bl+bw<cl+cw) pLeft=_.distToLeft($c)-_.distToLeft($b)+_.bubPS/2
            else pLeft=$b.offsetWidth/2-_.bubPS/2  
            $p.css('left', pLeft+'px')
          }
          if((l=-$b.cssValue('left'))>0) {
              $b.css({left:0})                                    
              $p.css({left:`calc(50% - ${_.bubPS}px - ${l}px)`})
          }
          if((dif=$b.cssValue('left')+$b.offsetWidth-_.$html.offsetWidth)>0){
              l=_.$html.offsetWidth-$b.offsetWidth
              //$b.css({left:l})
              //$p.css({left:`calc(50% - ${_.bubPS}px + ${dif}px)`})    
          }          
          //log(_.distToLeft($c)-_.distToLeft($b)+_.bubPS/2)         
          if($cnt&&$cnt.hcl('textarea')){
              let h=0,$ta=$cnt.find('textarea')
              if(!$ta.cssValue('height')){
                $ta.hide()
                $cnt.chi($ch=>{ if($ch.localName!='textarea') h+=$ch.marginHeight() })
                $ta.show()
                //log($t,$t&&$t.offsetHeight||0,h)        
                $ta.css('height',`calc(100% - ${h}px)`)
              }
          }          
          $c.$bubble=$b
          let ih=0
          if($cnt){
            $cnt.chi($chi=>ih+=$chi.offsetHeight)
            if($cnt.offsetHeight<ih){
              _.nroc.add($b)
            }
          }
          if($cnt&&(!$cnt.ScrollBar&&d.height||$cnt.offsetHeight<$cnt.scrollHeight)) $cnt.ScrollBar=new ScrollBar($cnt,{width:'10px'})                                        
          return $b
        })()
        if(d.disappear)setTimeout(()=> $b.rm(),d.disappear*1000)
        if(d.rmv)d.rmvEvent=d.rmv
        $b.rmvEvent=()=>{
            _.foreach($b.includes,$e=>{
                if(typeof $e=='function')return
                $e.removeEventListener('mouseleave',mouseleave)
                $e.removeEventListener('mouseenter',mouseenter)    
            })
            if(d.rmvEvent) d.rmvEvent($b)
            if(d.$cnt&&d.$cnt.tlBub)d.$cnt.tlBub.rmv()
            delete _.bubbles[d.id]
            window.hiddenBubbles.delete($b)
            _.$body.css('position','static')
            //log('removed',$b)
        }
        if(d.clb) d.clb($b)
        $b.includes=[]
        let mouseleave=e=> hoverTO=setTimeout(()=> $b.rmv(), htoDelay)
        let mouseenter=e=> {            
            if(d.onOver) d.onOver($b)
            clearTimeout(hoverTO)
        }
        let hoverEvents=$e=>{
          $e.addEventListener(pointer+'leave', mouseleave)
          $e.addEventListener(pointer+'enter', mouseenter)         
        }
        $b.include = $e=>{
            if($b.includes.indexOf($e)==-1) {
                $b.includes.push($e)
                if(d.style=='hover') hoverEvents($e)
            }    
        }
        if(d.style=='hover') {
            $b.include($c)
            //hoverEvents($b)
        }
        if(d.autoRmv) setTimeout(()=> $b&&$b.rmv(), d.autoRmv)       
        $b.put = ($cnt_,replace=true)=> {
            //replace&&$cnt?.rm()
            replace&&$cnt&&$cnt.rm()
            $cnt_.to($b)
            $b.$cnt=$cnt_
            $b.correctPosition()
            $cnt=$cnt_
        }
        if(d.hide) {
            $b.css({visibility:'hidden'})
            window.hiddenBubbles.add($b)
        }
        $b.$cntr = ()=>$b.chi(1)
        //if($cnt?.chi(0)?.localName=='textarea')$cnt.chi(0).focus()
        let onFocus= ()=> !d.dontCorrectOnFocus&&$b.correctPosition(_.touchscreen)
        _.ech($b.find('textarea, input[type=text]'),$input=> $input.ev('focus',e=> onFocus()))                
        if($cnt&&$cnt.chi(0)&&$cnt.chi(0).localName=='textarea')$cnt.chi(0).focus()
        if(d.nroc)_.nroc.add($b)
        _.ech($imgs,$img=>{
            $img.onload=()=>{
                imgsLoadedCount++
                if(imgsLoadedCount==$imgs.length||_.isE($imgs)){
                    $b.correctPosition()
                    $b.css({visibility:'visible'})
                }
            }
        })
        if(d.close){
            let s=8.5
            _.$({},'close').css({cursor:'pointer',position:'absolute',top:-s+'px',right:-s+'px',background:bc,'border-radius':'50%',width:'26px',height:'26px','font-size':'26px',display:'flex','justify-content':'center','align-items':'center'}).html('&#10799;').to($b).onclick=e=> $b.rmv()
            //$b.css({'padding-top':s*2+'px', height: $b.offsetHeight-s*2+'px' })
            //$cnt.css('height',$cnt.offsetHeight-s*2+'px')
        }    
        return $b
    }
    list(list,d={}){
        let _=this
        let $list,$i,icons=d.icons||null
        $list = _.$({},'list').css({overflow:'hidden',cursor:'pointer',background:d.bg||_.listBg})
        if(d.height)$list.css({height:d.height+'px',overflow:'hidden'})
        if(d.cl)$list.acl(d.cl)
        $list.checked={} 
        let refreshChecks=()=>{
          $list.checkedA=[]
          for(let id in $list.checked) $list.checkedA.push(id)             
        }       
        $list.check = id=>{
          let $i=$list.find(`[search=id${id}]`)  
          if(!d.multi) $list.chi($i=> {$i.find('check').css({visibility:'hidden'}),$list.checked[$i.id]=false})
          $i.find('check').css({visibility:'visible'})                    
          $list.checked[id]=true                
          refreshChecks()
        }
        $list.uncheck = id=>{
          let $i=$list.find(`[search=id${id}]`)
          $i.find('check').css({visibility:'hidden'})
          delete $list.checked[id]
          refreshChecks()                   
        }        
        _.foreach(list,(v,id,i)=>{            
            $i=_.$({id},'item').attr('search','id'+id).css({padding:_.listIP,position:'relative'}).html(v).to($list)
            if(d.fc)$i.css('color',d.fc)
            $i.v=v
            let fs=d.fs||$i.cssValue('font-size')-1
            if(!d.noCheck) _.$({},'check').css({display:'inline','font-size': fs+'px',visibility:'hidden'}).html('&nbsp;&#10004;').to($i)
            log(d.hoverColor)
            _.hover($i,$i=>$i.css({background:d.hover,color:d.hoverFc||'initial'}),$i=>$i.css({background:'transparent',color:d.fc}))             
            let standard=$i=>{
                let id=$i.id
                if(!$list.checked[id])$list.check(id)
                else $list.uncheck(id)                            
            }
            $i.onclick=e=>{
                let $i=e.currentTarget
                if(!d.noCheck) d.choose?d.choose($i.id,$i.v):standard($i)
                d.click&&d.click($i)
            }
            if(icons) _.$({},'icon').css({'margin-right':'10px',width:fs+'px',height:fs+'px',background:`url(${icons[i]}) no-repeat center/contain`})._to($i)
        })
        return $list            
    }
    textarea(d){
        let _=this,$c,$t,$b,width=d.width?d.width:'100%',height=d.height,className=d.className||'bubble',bClassName=d.className||'textarea-bubble',bHeight=0,observer
        $c=_.$({cl:'textarea'},'cntr').css({width,position:'absolute',visibility:'hidden',background:className=='bubble'?_.bubBC:'','border-bottom-left-radius':'5px','border-bottom-right-radius':'5px'}).to(_.$body)
        $t=_.$({className,placeholder:d.placeholder||''},'textarea').css({display:'block',width:'100%'}).to($c)        
        $t.value=d.content||''
        if(d.maxLength) $t.attr({maxLength:d.maxLength})
        if(d.attr) d.attr.ech((v,n)=>$t.attr(n,v))
        if(d.btnValue){
          $b=_.$({className:bClassName},'button').css({width:'100%',padding:'5px'}).to($c).html(d.btnValue)
          if(d.buttonColor)$b.css('background',d.buttonColor)
          $b.addEventListener('click',e=> {
              if(d.minLength&&$t.value.length<d.minLength){
                  $c.tlBub=_.bubble({$c:$b,cnt:d.minLengthText+d.minLength,type:'info',disappear:2})
                  return
              }
              d.post($t.value)
          })
          bHeight=$b.marginHeight()
          observer=new IntersectionObserver(e=>{
              let $cov=e[0].target.$
              $cov.r=e[0].intersectionRatio
          },{threshold:[0]})          
        }                             
        $t.css({height:height||`calc(100% - ${bHeight}px)`})
        if(d.inputFilter)$t.setInputFilter(d.inputFilter)
        $c.css({position:'relative',visibility:'visible'})
        if(d.to){            
            $c.to(d.to)
            return $t
        }
        let $cov
        $t.onfocus=e=>{
            $cov=_.$({},'cover').css({position:'absolute',width:'100%',height:_.$body.offsetHeight+'px','z-index':1,top:0}).to(_.$body)
            observer.observe($cov)
            setTimeout(()=>{                
                
            },1000)    
        }
        $t.onblur=e=> $cov.rm() 
        return $c
    }
    punkts(d){
        let _=this
        let $c=d.$c,chosen=d.chosen||0,orient=d.orient||'h',$punkts
        $punkts=_.$({className:d.class||''},'punkts').css({display:'flex','flex-direction':orient=='h'?'row':'column'}).to($c)
        _.foreach(d.ids,(id,i)=>{            
            $punkts[id] = _.$({id},'punkt').attr('chosen','false').html(d.values[i]).to($punkts)
            if(i===chosen) $punkts[id].attr('chosen','true')
            $punkts[id].onclick=e=>{
                let $p=_.$(e.currentTarget)
                _.foreach(d.ids,th=> $punkts[th].attr('chosen','false'))    
                $p.attr('chosen','true')
            }
        })
        return $punkts
    }
    select(name,list){ //log(list)
        let _=this,$select,$o
        $select=_.$({name},'select')
        _.foreach(list,(attr,n)=> {
            $o=_.$({},'option').to($select)
            if(typeof attr=='object') $o.attr(attr).html(attr.name)
            else $o.attr('value',n).html(attr)
        })
        $select.change = function(v){                       
          let $select=this, $o
          if(!v)$select.trigger('change')
          _.foreach($select.chi(),o=> {
            if(v!==void 0&&o.value==v.toString())$o=o
          })
          if($o){ 
            $o.selected = true
            if ("createEvent" in document) {
                let e = document.createEvent("HTMLEvents")
                e.initEvent("change", false, true)
                $select.dispatchEvent(e)
            } else $select.fireEvent("onchange")
          }           
        }
        //log('set change of ',$select)
        return $select        
    }
    horScrollList($c,items,name='item'){        
        let _=this
        _.counts.horScrollList++
        let $cntr=_.$({},'cntr').css({overflow:'hidden','align-items':'center',height:'100%'}),$cnt=_.$({},'cnt').css({display:'block'}).to($cntr),
            $items=[],$arrows=[],arrows={left:'&#9668;',right:'&#9658;'},
            c=1,oml,count,ani=false,width=0
        $c.css({display:'flex',position:'relative'})
        _.ech(['left','right'], cl=> $arrows.push( _.$({cl},'arrow').html(arrows[cl]).css({color:'grey',height:'100%',position:'absolute',top:0,[cl]:0,display:'flex','align-items':'center','justify-content':'center',cursor:'pointer'}).to($c)))        
        let [$al,$ar]=$arrows        
        $cntr.af($al)
        _.ech(items,(cnt,id)=> $items.push(_.$({id},name).css({display:'inline-block'}).html(cnt).to($cnt)))              
        $cntr.css('width',$c.offsetWidth-$al.offsetWidth*2+'px')
        _.ech($arrows, $a=>$a.css({width:$a.offsetHeight/2+'px'}).hide(1))
        $c.css({padding:'0 '+$al.offsetWidth+'px'})
        _.ech($items,$item=>width+=$item.marginWidth())
        $cnt.css({'width':width+1+'px'})
        $cnt.css({'margin-top': ($cntr.offsetHeight-$cnt.offsetHeight)/2+'px'})         
        count=$items.length
        oml=$items[0].cssValue('margin-left')
        let countHiddenRight=c=>{
            let co=0
            for(let i=c;i<count;i++) if(!$items[i].cssValue('opacity'))co++
            return co
        }
        _.ech($items,$item=>{
            $item.observer=new IntersectionObserver(e=>{
                let $i=e[0].target.$,o
                o=e[0].intersectionRatio==1?1:0
                $i.ani({w:'io'+_.counts.horScrollList,k:$i.id,p:0.1,css:{opacity:o},fin:d=> countHiddenRight(1)&&$ar.show(1)||$ar.hide(1) })
            },{threshold:[1]})
            $item.observer.observe($item)             
        })                       
        _.ech($arrows, $a=> $a.onclick=e=>{
            if(ani)return
            let $a=e.currentTarget.$,di=$a.className,ml=$items[0].cssValue('margin-left'),t,l,$i=$items[0],m,chrb=countHiddenRight(c),chra
            if(di=='left'&&c==1)return
            l=di=='right'?1:2
            m=di=='right'?-1:1
            t=m*$items[c-l].marginWidth()+ml
            if(c==2&&di=='left')t=oml
            ani=true
            _.ani({w:'hsl',f:ml,t,p:0.3,fin:d=>{
                c+=di=='right'?1:-1
                chra=countHiddenRight(c)
                !chra?$ar.hide(1):$ar.show(1)
                c==1?$al.hide(1):$al.show(1)
                ani=false
                if(chrb==chra&&chra&&c!=1)$arrows[di=='right'?1:0].click()
            }},d=>$i.css('margin-left',d.c+'px'))
        })
        $c.$items=$items                   
    }
    radio(d){
        let _=this,id,v,$cntr,$r,$ic
        $cntr=_.$({},'cntr').css({display:'flex',background:d.bg||'transparent'})
        if(d.title)_.$({},'tit').html(d.title).to($cntr)
        _.ech(d.buttons,(b,i)=>{
            if(typeof b!='object') [id,v]=[b,b]
            else [id,v]=[b[0],b[1]]
            $r=_.$({type:'radio',id,name:d.name},'input').attr('value',v).to($cntr)
            if(d.checked!==void 0&&d.checked===i) $r.checked=true
            _.$({},'v').html(v).to($cntr)
        })
        $ic=_.$({},'info-cntr').to($cntr)
        if(d.setInfo)$ic.setInfo({size:d.infoSize||20,right:0,bg:'black',col:'white',top:d.infoTop||0})
        $cntr.$info=$ic.$info
        return $cntr
    }
    inputText(d){
        let _=this,$it,v=d.value||''
        $it=_.$({id:d.id||'',type:d.pass?'password':'text',placeholder:d.placeholder||'',cl:d.className||''},'input')
        $it.value=v
        if(d.numbers)$it.setInputFilter(v=> /^[\d\,\-]+$/gm.test(v))
        if(d.good) $it.acl('good').css({'border-radius':'25px','border':'1px solid transparent'})
        if(d.cute) $it.acl('cute').css({'border-radius':'15px','border':'1px solid transparent'})
        $it.css(d.css||{})
        if(d.$c)$it.to(d.$c)
        if(d.input)$it.ev('input',d.input)
        return $it
    }
    lister(d){
        let _=this,$up,$down,$cntr,$cnt,aHeight=d.aHeight||50,aBg=d.aBg||'powderblue',
            aCss={color:d.aColor||'#000','font-size':aHeight/2+'px',cursor:'pointer',display:'flex','justify-content':'center','align-items':'center',height:aHeight+'px',width:'100%',background:aBg,'-webkit-touch-callout':'none','-webkit-user-select':'none','-ms-user-select':'none','user-select':'none'},
            padding=d.padding||'10px',$item,click=d.click||(()=>{}),items=d.items,$first,ani_p=.5,prevMt=0,page=1,pageMt={1:0},visibles=new Set()
        $cntr=_.$({},'cntr').css({width:'100%',height:d.height}).to(d.$c)
        if(d.cl)$cntr.acl(d.cl)
        //$cntr.hiddenCount=0
        $up=_.$({},'up').css(aCss).html('<sym style="transform:rotate(-90deg)">&#10095;</sym>').to($cntr)
        $up.find('sym').hide()
        $cnt=_.$({},'cnt').css({overflow:'hidden',width:'100%',height:`calc(100% - ${aHeight*2}px)`}).to($cntr)
        $down=_.$({},'down').css(aCss).html('<sym style="transform:rotate(90deg)">&#10095;</sym>').to($cntr)
        let observe = $item=> {
          if($item.observer) $item.observer.disconnect() 
          $item.observer=new IntersectionObserver(e=>{
              //if($.ScrollMenu&&$.ScrollMenu.jumping)return
              let $i=e[0].target.$,r,$downSym=$down.find('sym')
              r=e[0].intersectionRatio
              //if(r>0&&r<1) $cntr.$lastVisible=$i
              if(r===0)visibles.delete($i.indx()) 
              else visibles.add($i.indx())
              let m=0
              //log('')
              for(let i of visibles.values())i>m&&(m=i) 
              $cntr.$lastVisible=$cnt.chi(m)                                               
              $i.ani({w:'lvop',k:$i.index,css:{opacity:r},p:0.1,fin:d=>{
                let $lv=$cntr.$lastVisible
                if($lv==$i) $lv.cssValue('opacity')?$downSym.show():$downSym.hide()
              }})
              //log($i)
          },{threshold:[1]})
          $item.observer.observe($item)        
        }
        ;($cntr.add = (items,ft=false)=>{
          _.ech(items,(item,i)=> {
              $item=_.$({},'item').css({padding}).html(item).to($cnt)
              if(ft&&!i)$first=$item
              $item.index=$cnt.chi().length-1
              observe($item)
          })
        })(items,true)
        let onClick=e=> {
            let $e=e.currentTarget.$
            $e.find('sym').css('display')!='none'&&!$cntr.animating&&click($e.localName)
        }
        $up.onclick = e=> onClick(e)
        $down.onclick = e=> onClick(e)
        $cntr.scroll = dir=>{
            let f=$first.cssValue('margin-top'),$lv=$cntr.$lastVisible
            if(!$lv){
                let $v=false
                $cnt.chi($i=>{
                    if($i.cssValue('opacity')==1)$v=true
                    if($v&&!$i.cssValue('opacity')){
                        $lv=$i
                        $v=false
                    }
                })
            }
            let lvDist=$lv.offsetTop-$lv.prnt().offsetTop,t,$upSym=$up.find('sym'),$downSym=$down.find('sym')
            $cntr.$lastVisible=null            
            if(dir=='down'){
                t=f-lvDist
                //log($lv,lvDist,t)
                page++
                pageMt[page]=t
            } else {
                page--                
                t=pageMt[page]
            }
            page!=1?$upSym.show():$upSym.hide()
            $cntr.animating=true            
            $first.ani({w:'lister',css:{'margin-top':t},p:ani_p,fin:d=>{
                $cnt.chi($i=>observe($i))
                $cntr.animating=false                                
            }})              
        }
        $cntr.hiddenCount=()=>{
            let startedCount=false,o,c=0
            $cnt.chi($i=>{
                o=$i.cssValue('opacity')
                if(o==1)startedCount=true
                if(startedCount&&!o)c++
            })    
            return c
        }       
        return $cntr
    }
    checkbox(d){
        let _=this,$cntr=_.$({cl:'checkbox-cntr'},'cntr').css({display:'flex','align-items':'center',cursor:'pointer'}).to(d.$c),size='15px',sizeInt=parseInt(size),checked=d.checked||false,color=d.color||'white',background=d.bg||'black',$checkBox
        if(d.invert)$cntr.css({'justify-content':'flex-end','text-align':'right'})
        $checkBox=_.$({},'checkbox').css({display:'flex','justify-content':'center','align-items':'center',color:'white',background:'black',width:size,height:size,'line-height':size,padding:'3px','border-radius':'3px','font-size': sizeInt-3+'px' }).html('&#10004;').to($cntr)
        $cntr.noSelect()
        $cntr.checked=true
        $cntr.toggle=(trigger=true)=>{
            if($cntr.checked){
                $cntr.checked=false
                $checkBox.css('color',background)
            }else{
                $cntr.checked=true
                $checkBox.css('color',color)
            }
            if(trigger)d.change($cntr.checked)        
        }
        !checked&&$cntr.toggle(false)
        $cntr.onclick = e=> $cntr.toggle()
        let $cap=_.$({},'cap').css('margin-'+(d.invert?'right':'left'),'10px').html(d.cap)
        d.invert?$cap._to($cntr):$cap.to($cntr)        
    }
    expand(d){
        let _=this,$c=d.$c,$cntr,$t,$cap,$tools,$cnt,$pm,p='&#10010;',m='&#9866;',firstTime=true,waiting=false
        $cntr=_.$({cl:d.cl||d.className||'',id:d.id||''},'expand').css({'width':'100%'})
        if($c)$cntr.to($c)
        $cntr.$t=$t=_.$({},'tit').css({display:'flex',padding:'10px',cursor:'pointer','align-items':'center',position:'relative'}).to($cntr).noselect()
        $pm=_.$({},'sign').to($t)
        $cnt=_.$({cl:'expand'},'expand-cnt').html(d.$cnt||'').to($cntr).hide()
        $cntr.$cnt=$cnt
        $cntr.$cap=$cap=_.$({},'cap').html(d.title).to($t)
        $cntr.$tools=$tools=_.$({},'tools').css({'margin-left':'10px'}).to($t)
        $pm.html(p)
        $cnt.hide()
        $cntr.expand = ()=>{
            if(waiting)return
            $cnt.css('display',d.flex?'flex':'block')
            if(d.flex){
                $cnt.css('flex-direction','column')
                if(d.flex==2)$cnt.css('flex-direction','row')
            } 
            $pm.html(m)
            if(d.onOpen&&firstTime){
                firstTime=false
                d.onOpen($cnt)
            }
            $cntr&&$cntr.prnt(null,$p=> $p&&$p.ScrollBar&&$p.ScrollBar.refresh())
            $cntr.prnt()&&$cntr.prnt().chi($chi=> {
                $chi.ScrollBar&&$chi.ScrollBar.refresh()
            })             
        }
        $cntr.collapse = ()=>{
            $cnt.hide()
            $pm.html(p)
            $cntr.prnt(null,$p=> $p.ScrollBar&&$p.ScrollBar.refresh())              
        }
        $cntr.$t.ev('click',e=>{
            if(e.target.$.prnt('tools'))return
            if($cnt.css('display')=='none') $cntr.expand()
            else $cntr.collapse()          
        })
        if(d.wait){
            let size=Math.ceil($cntr.$t.offsetHeight*.7)
            $cntr.$wait=_.$('+wait-icon').css({height:size+'px',width:size+'px',background:`white url(${_.waitIcon}) no-repeat center 50%/100%`,'border-radius':'50%'}).to($cntr.$t)
            waiting=true
        }
        $cntr.loaded = ()=>{
            $cntr.$wait.hide(1)
            waiting=false
            if(d.expand)$cntr.expand()    
        }
        return $cntr                    
    }
    editString(d){ 
        let _=this,$c=d.$c,w=$c.offsetWidth,h=$c.offsetHeight,$i=_.$({type:'text'},'input').css({width:w+'px',height:h+'px'})
        d.trigger.ev('click',e=>{
            $c.attr('contentEditable','true')
            $c.focus()
        	let sel, range
        	sel = window.getSelection()
        	if(sel.toString() == ''){
        	   window.setTimeout(function(){
        	       range = document.createRange()
        	       range.selectNodeContents($c)
        	       sel.removeAllRanges()
        	       sel.addRange(range)
        	   },1)
        	}
        })
        $c.ev('blur',e=>d.save($c.html()))
        $c.ev('keydown',e=>{
          if(e.key=='Enter') {
            e.preventDefault()
            $c.blur()
            if(window.getSelection) {
              if(window.getSelection().empty) window.getSelection().empty()
              else if(window.getSelection().removeAllRanges) window.getSelection().removeAllRanges()
            }
          }            
        })        
    }
    todos(d){
        let _=this,texts=d.texts,todos=d.todos,$todos,$todo,$s,$t
        $todos=_.$('+todos')
        _.ech(todos,(v,n)=>{
            $todo=_.$('+todo').css({color:v?d.doneCol||'black':d.notDoneCol||'grey'}).acl('flex').to($todos)
            $s=_.$('+sign').html(v?'&#10004;':'&#10799;').to($todo)
            $t=_.$('+text').html(texts[n]).to($todo)
        })
        return $todos
    }
    grid(w,h,$c,sizes=[]){
        let _=this,$grid=_.$('+grid').css({width:'100%',height:'100%'}),width,height=100/h+'%',$row,$cell
        let cw
        for(let i=1;i<=h;i++){
            $row=_.$('+row').css({height,width:'100%',display:'flex'}).to($grid)
            cw=sizes[i-1]
            if(!cw)cw=w
            width=100/cw+'%'
            for(let x=1;x<=cw;x++){                
                $grid[''+(''+x+i)]=$cell=_.$('+cell').css({width,height:'100%'}).to($row)
            }                
        }
        return $grid.to($c)
    }
    punkts2(d){
        let _=this,$p,$c=d.$c,css=d.css,pos=d.position,posVari={tl:'bottom-right top left'},
            posVars=posVari[pos].split(' '),brCssN=`border-${posVars[0]}-radius`,brCss={[`${brCssN}`]:'10px'},pBrCss={[`${brCssN}`]:'8px'}
        $c.css({display:'flex',position:d.pos||'absolute',[posVars[1]]:0,[posVars[2]]:0,...brCss})
        let _choose=$p=>{
          $p.sib().ech($s=> $s.css(css[0]))
          $p.css(css[1])
          d.choose($p.id)            
        }
        d.punkts.ech((v,id,i)=>{
            $p=_.$({id},'punkt').html(v).css({'cursor':'pointer',padding:'2px 7px'}).to($c)
            $p.ev('click',(e,$p)=>_choose($p))
            if(['tl','tr'].includes(pos) && i==Object.values(d.punkts).length-1 )$p.css(pBrCss)
            if(i==(d.chosen||0))_choose($p)
        })            
    }
    counter(d){
        let _=this,$cntr=_.$('+counter').css({display:'flex','align-items':'center'}),$l=_.$('+left').html('&#10094;').to($cntr),$n=_.$({type:'text'},'input').to($cntr),$r=_.$('+right').html('&#10095;').to($cntr)
        let step=d.step||1
        if(d.$c)$cntr.to(d.$c)
        if(d.default===0&&d.zeroInf)d.default='∞'
        $cntr.n=$n.value=d.default||1
        let change = s=> {
            $n.value=(+$n.value||0)+s
            if(d.max&&+$n.value>d.max)$n.value=d.max
            $n.trigger('input')
            $cntr.n=$n.value
            d.changed&&d.changed($n.value)
        }
        $l.css({cursor:'pointer','margin-right':'2px'}).onclick=e=> change(-step)
        $r.css({cursor:'pointer','margin-left':'2px'}).onclick=e=> change(+step)
        $n.css({width:'20px','border-radius':0,height:'15px','font-size':'13px','text-align':'center'})
        if(d.min!==undefined)$n.attr({min:d.min})
        if(d.zeroInf)$n.attr({'zero-inf':1})
        $n.setInputFilter(v=> /^[\d\-]+$/gm.test(v))
        return $cntr
    }
    yesNo(d){
        let _=this,$yn=_.$('+yesno').css({display:'block',cursor:'pointer','font-size':'20px','min-width':'50px','border-radius':'10px','text-align':'center'}).to(d.$c).noselect(),
            $y=_.$('+yes').css({display:'block',background:'white',color:'#62D073','border-radius':'10px',padding:'2px 7px 5px 7px'}).html(d.yn[0]).to($yn),
            $n=_.$('+no').css({display:'block',background:'#ED8577',color:'white','border-radius':'10px',padding:'2px 7px 5px 7px'}).html(d.yn[1]).to($yn)
        if(d.cl) $yn.acl(d.cl)
        let change=(w,trig=1)=> {            
            if(!w)w=$yn.w=='yes'?'no':'yes'
            w=='yes'?($y.show('block'),$n.hide()):($n.show('block'),$y.hide())
            $yn.w=w
            let b=w=='yes'?1:0
            $yn.b=b
            if(trig)d.onchange&&d.onchange(w,b)
        }
        +d.default?change('yes',false):change('no',false)
        $yn.onclick=e=> change()
        return $yn
    }
}