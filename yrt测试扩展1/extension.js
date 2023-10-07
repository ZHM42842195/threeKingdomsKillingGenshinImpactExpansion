game.import("extension",function(lib,game,ui,get,ai,_status){return {name:"测试01",content:function(config,pack){
    
},precontent:function(){
    
},help:{},config:{},package:{
    character:{
        character:{
            "01":["male","shen","1/3/2",["zhilv"],["forbidai"]],
            "测试":["male","shen",5,["nuowu","fenglun"],["forbidai"]],
        },
        translate:{
            "01":"01",
            "测试":"测试",
        },
    },
    card:{
        card:{
        },
        translate:{
        },
        list:[],
    },
    skill:{
        skill:{
            zhilv:{
                trigger:{
                    player:"damageEnd",
                },
                enable:"phaseUse",
                usable:1,
                group:["zhilv_mark","zhilv_get","zhilv_range","zhilv_damageAft"],
                subSkill:{
                    mark:{
                        marktext:"织",
                        intro:{
                            name:"织缕",
                            content:"mark",
                        },
                        sub:true,
                    },
                    range:{
                        mod:{
                            inRangeOf:function(from,to){
                if(from.hasMark("zhilv_mark")) return false;
            },
                        },
                        sub:true,
                    },
                    get:{
                        trigger:{
                            global:"phaseZhunbeiBegin",
                        },
                        forced:true,
                        filter:function(event,player){
                return  event.player.hasMark("zhilv_mark");
            },
                        content:function(){
                
                
                "step 0"
                var controls=[];
                controls.push('获得牌');
                controls.push('回复体力');
                controls.push('cancel2');
                event.controls=controls;
                var next=player.chooseControl(controls);
                next.set('choiceList',controls);
                next.set('prompt','请选择一项');
                "step 1"
                if(result.control!='cancel2'){
                player.logSkill(event.name,trigger.player);
                if(result.control=='获得牌'){
                    player.gainPlayerCard(trigger.player,'he',true);
                    trigger.player.removeMark('zhilv_mark');
                }
                else {
                    trigger.player.damage("nosource");
                    player.recover();
                }
                } 
                
                
                
               
            },
                        sub:true,
                    },
                    damageAft:{
                        trigger:{
                            player:"damageBegin4",
                        },
                        forced:true,
                        filter:function(event,player,trigger){
               return trigger.source.hasMark('zhilv_mark');
            },
                        content:function(){
                trigger.source.removeMark('zhilv_mark');

            },
                        sub:true,
                    },
                },
                content:function(){
        'step 0'
        var controls=[];
        if(ui.cardPile.hasChildNodes()) controls.push('选择牌堆中的一张牌');
        if(ui.discardPile.hasChildNodes()) controls.push('选择弃牌堆中的一张牌');
        if(game.hasPlayer(function(current){
            return current.countCards('hej')>0;
        })) controls.push('选择一名角色区域内的一张牌');
        if(!controls.length){event.finish();return;}
        event.controls=controls;
        var next=player.chooseControl();
        next.set('choiceList',controls)
        next.set('prompt','请选择要移动的卡牌的来源');
        next.ai=function(){return 0};
        'step 1'
        result.control=event.controls[result.index];
        var list=['弃牌堆','牌堆','角色'];
        for(var i=0;i<list.length;i++){
            if(result.control.indexOf(list[i])!=-1){event.index=i;break;}
        }
        if(event.index==2){
            player.chooseTarget('请选择要移动的卡牌的来源',true,function(card,kagari,target){
                return target.countCards('hej')>0&&!target.hasMark('zhilv_mark');
            });
        }
        else{
            var source=ui[event.index==0?'discardPile':'cardPile'].childNodes;
            var list=[];
            for(var i=0;i<source.length;i++) list.push(source[i]);
            player.chooseButton(['请选择要移动的卡牌',list],true).ai=get.buttonValue;
        }
        'step 2'
        if(event.index==2){
            player.line(result.targets[0]);
            event.target1=result.targets[0];
            player.choosePlayerCard(result.targets[0],true,'hej').set('visible',true);
            if(!result.targets[0].hasMark('zhilv_mark')){
            result.targets[0].addMark('zhilv_mark',1);
        }
        }
        else{
            event.card=result.links[0];
        }
        'step 3'
        if(event.index==2) event.card=result.cards[0];
        var controls=[
            '将这张牌移动到牌堆的顶部或者底部',
            '将这张牌移动到弃牌堆的顶部或者底部',
            '将这张牌移动到一名角色对应的区域里',
        ];
        event.controls=controls;
        var next=player.chooseControl();
        next.set('prompt','要对'+get.translation(event.card)+'做什么呢？');
        next.set('choiceList',controls);
        next.ai=function(){return 2};
        'step 4'
        result.control=event.controls[result.index];
        var list=['弃牌堆','牌堆','角色'];
        for(var i=0;i<list.length;i++){
            if(result.control.indexOf(list[i])!=-1){event.index2=i;break;}
        }
        if(event.index2==2){
            player.chooseTarget('要将'+get.translation(card)+'移动到哪一名角色的对应区域呢',true).ai=function(target){
                return target==_status.event.player?1:0;
            };
        }
        else{
            player.chooseControl('顶部','底部').set('prompt','把'+get.translation(card)+'移动到'+(event.index2==0?'弃':'')+'牌堆的...');
        }
        'step 5'
        if(event.index2!=2){
            //if(event.target1) event.target1.lose(card,ui.special);
            //else card.goto(ui.special);
            event.way=result.control;
        }
        else{
            event.target2=result.targets[0];
            var list=['手牌区'];
            if(lib.card[card.name].type=='equip'&&event.target2.canEquip(card)) list.push('装备区');
            if(lib.card[card.name].type=='delay'&&!event.target2.isDisabledJudge()&&!event.target2.hasJudge(card.name)) list.push('判定区');
            if(list.length==1) event._result={control:list[0]};
            else{
                player.chooseControl(list).set('prompt','把'+get.translation(card)+'移动到'+get.translation(event.target2)+'的...').ai=function(){return 0};
            }
        }
        'step 6'
        if(event.index2!=2){
            var node=ui[event.index==0?'discardPile':'cardPile'];
            if(event.target1){
                var next=event.target1.lose(card,event.position);
                if(event.way=='顶部') next.insert_card=true;
            }
            else{
                if(event.way=='底部') node.appendChild(card);
                else node.insertBefore(card,node.firstChild);
            }
            game.updateRoundNumber();
            event.finish();
        }
        else{
            if(result.control=='手牌区'){
                var next=event.target2.gain(card);
                if(event.target1){
                    next.source=event.target1;
                    next.animate='giveAuto';
                }
                else next.animate='draw';
            }
            else if(result.control=='装备区'){
                if(event.target1) event.target1.$give(card,event.target2);
                event.target2.equip(card);
            }
            else{
                if(event.target1) event.target1.$give(card,event.target2);
                event.target2.addJudge(card);
            }
        }
        'step 7'
        game.updateRoundNumber();
    },
                ai:{
                    order:10,
                    result:{
                        player:1,
                    },
                },
            },
            nuowu:{
                group:["nuowu_damage","nuowu_lose"],
                mod:{
                    targetInRange:function(card,player){
            if(card.name=='sha'&&_status.currentPhase==player) return true;
        },
                },
                audio:"ext:测试01:2",
                trigger:{
                    player:"useCard",
                },
                forced:true,
                filter:function(event,player){
        return event.card.name=='sha'&&_status.currentPhase==player;
    },
                content:function(){
        trigger.directHit.addArray(game.players);

    },
                subSkill:{
                    damage:{
                        selectTarget:-1,
                        trigger:{
                            source:"damageBegin4",
                        },
                        forced:true,
                        filter:function(event,player,card){
                return event.card.name=="sha";
            },
                        filterTarget:function(event,player,trigger,target){
                return get.distance(trigger.player,target)<=1&&target!=player&&target!=trigger.player;
            },
                        content:function(){
                'step 0'
                var targets=game.filterPlayer(function(current){
                return get.distance(trigger.player,current)<=1;
                 }).sortBySeat();
                if(!targets.length) event.finish();
                else{
                
                var i=0;
                for(i=0;i<targets.length;i++){
                   if(targets[i]!=player&&targets[i]!=trigger.player)
                targets[i].damage(event.nature,1,'nosource');
                 }
                }
            },
                        sub:true,
                    },
                    lose:{
                        trigger:{
                            player:"phaseZhunbeiBegin",
                        },
                        forced:true,
                        filter:function(event,player){
                return player.hp>0;
            },
                        content:function(){
                player.loseHp();
            },
                        sub:true,
                    },
                },
            },
            fenglun:{
                audio:"ext:测试01:1",
                usable:1,
                trigger:{
                    source:"damageEnd",
                },
                filter:function(trigger,event,player){
        return trigger.player!=player;
    },
                content:function(){
        var target=trigger.player;
                game.broadcastAll(function(target,player){
            game.swapSeat(target,player);
        },target,player)
    },
            },
        },
        translate:{
            zhilv:"织缕",
            "zhilv_info":"每回合各限一次，出牌阶段或当你受到伤害后，你可以移动一名没有“织”标记的角色区域内/牌堆/弃牌堆中的一张牌到一名角色区域内/牌堆/弃牌堆顶/底部。若你以此法移动了一名角色区域内的牌，你令其获得一个“织”标记，你视为不在拥有“织”标记的角色的攻击范围内。拥有“织”标记的角色的准备阶段，你需选择一项：①令其交给你一张牌，然后移除其“织”标记；②令其失去一点体力，然后你回复一点体力",
            nuowu:"傩舞",
            "nuowu_info":"锁定技，你使用的【杀】无距离限制且不可被响应，你使用的【杀】对一名角色造成伤害后，你对与其距离为1的所有角色造成一点同属性伤害；准备阶段，你失去一点体力",
            fenglun:"风轮",
            "fenglun_info":"每回合限一次，当你对一名其它角色造成伤害后，你可以与其交换座次",
        },
    },
    intro:"",
    author:"无名玩家",
    diskURL:"",
    forumURL:"",
    version:"1.0",
},files:{"character":["01.jpg","测试.jpg"],"card":[],"skill":[]}}})