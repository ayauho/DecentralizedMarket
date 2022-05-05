import { Helper } from '/test/js/Helper.js'
export class ScrollBar extends Helper{
constructor($c,inp={}){
        super()
        let _=this
        _.variables($c,inp)
        _.init()
    }
    get barHeight(){return _.$bar.offsetHeight}
    variables($c,inp){
        let _=this
        _.surface=true        
        _.$c=_.$($c)
        _.width='20px'                   
        _.trackCol='#EEE'
        _.barCol='#AAA'
        _.stepKoef=1
        _.overflow=0
        _.$c.scrollTopPrecise=0
        for(let i in inp)_[i]=inp[i]
        _.widthInt=parseInt(_.width)            
    }
    init(){
        let _=this
        _.$c.css({overflow:'hidden',position:'relative'})
        _.$track=_.$({},'scroll').attr('data-html2canvas-ignore','true').css({position:'absolute','z-index':'inherit',width:_.width,height:_.$c.scrollHeight+'px',top:0,right:0,background:_.trackCol}).to(_.$c)
        _.$track.ScrollBar=_
        _.$bar = _.$({},'bar').css({display:'block',width:_.width,background:_.barCol}).to(_.$track)
        if(_.punk){
            _.$bar.css({'border-radius':'50%',background:'black'})
            _.$track.css({background:'transparent','background-image':'linear-gradient(90deg, transparent, transparent calc((100% / 2) - 1px), black calc(100% / 2), transparent calc(100% / 2))','transform':'translate3d(0, 0, 0)'})
        }
        if(!_.surface)_.$c.css({'padding-right': _.$c.cssValue('padding-right')+_.widthInt+'px'})
        else _.$track.css('opacity',0.5)           
        _.refresh()
        _.wheel()
        _.drag()
        _.touchmove()
                    
    }
    refresh(toBottom=false,toTop=false){
        let _=this,h=_.$c.offsetHeight,mt        
        //log(_.$c.scrollTop)
        _.$track.css({display:'none'})
        if(!_.$c.scrollHeight)_.rel=1
        else _.rel=h/_.$c.scrollHeight
        _.$track.css({height:_.$c.scrollHeight+'px'})
        _.$track.css({display:'block'})        
        if(_.rel>1)_.rel=1
        _.$bar.css({height:(_.punk?_.widthInt:Math.floor(h*_.rel))+'px'})
        if(_.punk){
            _.trackingHeight = _.$c.scrollHeight-_.widthInt
            _.rel = (_.$c.clientHeight-_.widthInt)/(_.$c.scrollHeight - _.$c.clientHeight)
        }
        if(_.rel==1&&!_.punk || _.$c.scrollHeight <= _.$c.clientHeight){
            _.$track.css({visibility:'hidden'})
            _.$c.hasScrollBar=false
            _.$c.css({'touch-action':'auto'})
        }else{
            _.$track.css({visibility:'visible'})
            _.$c.hasScrollBar=true
            _.$c.css({'touch-action':'none'})
        }
        if(toTop) mt=0
        else mt=Math.floor(_.$c.scrollTop+_.$c.clientHeight*(_.$c.scrollTop/_.$c.scrollHeight))
        //console.trace(mt,_.$c.scrollTop,_.$c.clientHeight,_.$c.scrollHeight)
        _.$bar.css('margin-top',mt+'px')
        //log('REFRESHED',mt)                
        //_.iScrollHeight=_.$c.scrollHeight
        //_.jump(_.$c.scrollTop,true,true,false,toBottom)
        //_.jump(0)
    }
    get iScrollHeight(){return this.$c.scrollHeight}
    wheel(){        
        let _=this
        let wheel=e=>{
            if(_.rel<1)e.preventDefault()
            let delta=(-e.wheelDeltaY||e.deltaY*40),k,speed=200
            if((k=Math.abs(delta)/_.$c.offsetHeight)>1) delta/=k
            if(_.freeTop&&delta>0||_.freeBottom&&delta<0) _.scrollMenuPreventWheel(true)
            if(_.freeTop&&delta<0&&(speed=1) || delta>0&&_.$c.clientHeight+_.$c.scrollTop==_.$c.scrollHeight || delta<0&&_.$c.scrollTop || (delta<0 && !_.$c.scrollTop)) {
                //log(_.freeTop&&delta<0&&(speed=1),   delta>0&&_.$c.clientHeight+_.$c.scrollTop==_.$c.scrollHeight,   delta<0&&_.$c.scrollTop,   (delta<0 && !_.$c.scrollTop), speed, '_.freeTop',_.freeTop,'_.freeBottom',_.freeBottom)
                delta>0&&(_.freeBottom=true)&&(_.freeTop=false)
                delta<0&&(_.freeBottom=false)&&(_.freeTop=true)
                if(!(_.freeTop&&delta>0||_.freeBottom&&delta<0)) setTimeout(()=> _.scrollMenuPreventWheel(false),speed)
            }                                    
            _.jump(delta/_.stepKoef,true)          
        }
        let mouseenter=e=>{
            if(!_.$c.scrollTop) _.freeTop=true
            else _.freeTop=false
            if(_.$c.clientHeight+_.$c.scrollTop==_.$c.scrollHeight)_.freeBottom=true
            else _.freeBottom=false 
            _.scrollMenuPreventWheel(true)
        }
        let mouseleave=e=>{
            _.scrollMenuPreventWheel(false)    
        }
        _.$c.ev('wheel',wheel)
        _.$c.ev('mouseenter',mouseenter)
        _.$c.ev('mouseleave',mouseleave)         
    }
    scrollMenuPreventWheel(b){
        ('undefined'!=typeof $)&&$.ScrollMenu&&this.$c.hasScrollBar&&($.ScrollMenu.preventWheel=b)    
    }
    drag(){
        let _=this
        _.$bar.ev('mousedown touchstart',e=>{
            _.dragging=true            
            //_.sY=e.touches?.[0].pageY||e.pageY
            _.sY=e.touches&&e.touches[0].pageY||e.pageY
            if(_.rel<1)_.noTextSelect()
        })
        _.$body.ev('mouseup touchend',e=>{
            if(!_.dragging)return
            _.sY=void 0
            _.rmNoTextSelect()
            _.overflow=0
            setTimeout(()=> {
                _.scrollMenuPreventWheel(false)
                _.dragging=false
            },10)                
        })
        _.$c.ev('mousemove touchmove',e=>{
            if(_.sY===void 0)return
            //let pageY=e.touches?.[0].pageY||e.pageY, s=pageY-_.sY
            let pageY=e.touches&&e.touches[0].pageY||e.pageY, s=pageY-_.sY
            _.sY=pageY
            _.jump(s/_.rel)   
        })
        _.$track.ev('click',e=>{
            if(e.target.localName=='bar')return
            let step=(e.offsetY-_.$bar.cssValue('margin-top'))/_.rel
            _.jump(step)
        })        
    }
    touchmove(){
        let _=this     
        _.$c.ev('touchstart',e=>{ //log(_.$c,' touchstart')
            if(['bar','track'].includes(e.target.localName))return
            if(e.target.localName!='body' && _.lockBody ){
                let $bo=_.$('body')
                $bo.ta = $bo.css('touch-action')
                $bo.ov = $bo.css('overflow')
                $bo.di = $bo.css('display')
                //$bo.css({'touch-action':'none',overflow:'hidden',display:'none'})    
            }            
            _.dragging=true
            //_.scrollMenuPreventWheel(true)
            _.sY2=e.touches[0].pageY
            _.noTextSelect()
        })
        _.$c.ev('touchend',e=>{
            if(['bar','track'].includes(e.target.localName))return
            if(e.target.localName!='body' && _.lockBody ){
                let $bo=_.$('body')
                //$bo.css({'touch-action':$bo.ta,overflow:$bo.ov,display:$bo.di})    
            }
            _.sY2=void 0
            _.rmNoTextSelect()
            _.overflow=0
            //_.scrollMenuPreventWheel(false)    
        })                
        _.$c.ev('touchmove',e=>{
            if(_.sY2===void 0)return
            let pageY=e.touches[0].pageY, s=pageY-_.sY2            
            _.sY2=pageY
            _.jump(-s)             
        })
    }
    jump(step,wheel=false,straight=false,ani=false,toBottom=false,clb=()=>{}){ 
        //log('JUMPED',step)
        //log(step,wheel,straight,ani,toBottom)
        let _=this,initST=_.$c.scrollTopPrecise,b,a,mt,initStep=step
        
        //if(step>0&&_.punk || step<0&&!_.punk)step=Math.floor(step)      
        //else step=Math.ceil(step)

        if(_.rel==1&&!_.punk)return
        //log('init step',step)          
        if(!straight&&_.$c.scrollTop+_.$c.clientHeight+step>_.iScrollHeight)_.overflow+=step
        if(_.overflow>0){
            step=_.iScrollHeight-_.$c.scrollTop-_.$c.clientHeight
            _.overflow=0       
        }                       
        if(!ani){
            straight?(_.$c.scrollTop=step):(_.$c.scrollTopPrecise+=step,_.$c.scrollTop=_.$c.scrollTopPrecise)
            if(_.$c.scrollTopPrecise<0)_.$c.scrollTopPrecise=0
            if(!_.punk)mt=Math.floor(_.$c.scrollTop+_.$c.clientHeight*(_.$c.scrollTop/_.$c.scrollHeight))
            else mt = _.$c.scrollTopPrecise / (_.$c.scrollHeight-_.$c.clientHeight) * _.trackingHeight
            //log('step',step,_.$c.scrollTopPrecise, _.$c.scrollTop)
            if(mt+_.$bar.offsetHeight>_.$track.offsetHeight)mt=_.$track.offsetHeight-_.$bar.offsetHeight
            _.$bar.css({'margin-top':mt+'px'})
            if(_.$track.offsetHeight-_.$bar.offsetHeight-mt<2 && _.prevMt!=mt) _.onBottom&&_.onBottom()
            if(toBottom) _.toBottom()
        }else{
            //log('from=',_.$c.scrollTop,'to=',_.$c.scrollTop+step,'step=',step)
            mt=Math.floor(_.$c.scrollTop+step+_.$c.clientHeight*((_.$c.scrollTop+step)/_.$c.scrollHeight))
            _.ani({w:'st',f:_.$c.scrollTop,t:_.$c.scrollTop+step,p:0.3,fin:()=>{ 
                if(toBottom) _.toBottom() 
                clb()
                //log('scrollTop',_.$c.scrollTop,'scrollHeight-clientHeight',_.$c.scrollHeight-_.$c.clientHeight,'scrollHeight',_.$c.scrollHeight)
            }},d=>{
                //log('d.c',d.c)
                _.$c.scrollTop=d.c
            })            
            _.$bar.ani({w:'mt',p:0.3,css:{'margin-top':mt}})                           
        }
        //log('mt',mt,'scrollTop',_.$c.scrollTop)
        if(!mt&&_.prevMt!=mt&&_.onTop)_.onTop()
        _.prevMt=mt 
    }
    noTextSelect(){
        this.$c.css({'-webkit-touch-callout':'none','-webkit-user-select':'none','-ms-user-select':'none','user-select':'none'})
    }
    rmNoTextSelect(){
        this.$c.css({'-webkit-touch-callout':'auto','-webkit-user-select':'auto','-ms-user-select':'auto','user-select':'auto'})    
    }
    toBottom(ani=false,clb=()=>{}){
        let _=this
        //log('scrollTop',_.$c.scrollTop,'scrollHeight',_.$c.scrollHeight,'clientHeight',_.$c.clientHeight,'scrollHeight',_.$c.scrollHeight)
        //log('_.$c.scrollHeight-_.$c.clientHeight',_.$c.scrollHeight-_.$c.clientHeight)
        //log(_.$c.scrollHeight-_.$c.clientHeight-_.$c.scrollTop)
        _.jump(_.$c.scrollHeight-_.$c.clientHeight-_.$c.scrollTop,false,false,ani,false,clb)
    }
    jumpTo($e){
        let _=this
        let d=0
        _.$c.chi($chi=>{
            if($chi.css('position')=='absolute')return
            d+=$chi.marginHeight()
            if($chi==$e) return 'stop'    
        })     
        _.jump(d-$e.marginHeight(),false,true)
    }    
}