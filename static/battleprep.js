import {API} from './backend.js';
import {SimResults} from './results.js';

// Battle Class
class Battle{
    constructor(){
        document.getElementById("back_to_battle_list").onclick = function() {BattleInfo.showList()};
        document.getElementById('delete_battle').onclick = function() {BattleInfo.deleteBattle();}; 
        document.getElementById('run_button').onclick = function() {BattleInfo.run();};
        document.getElementById('view_battle').onclick = function() {BattleInfo.view();};
        document.getElementById('new_battle').onclick = function() {BattleInfo.newBattle();};
       
        this.battleListDiv = document.getElementById("BattleListCard");
        this.battleInfoDiv = document.getElementById("BattleInfoCard");
        this.numberOfBattles = document.getElementById('#ofBattles');
        this.validmsg = document.getElementById('battle_v');
        this.battleName = document.getElementById('bname');
        this.participants = document.getElementById('participants');
        this.battleList = document.getElementById('BattleList');
        this.status = document.getElementById('status');
        this.teams = [];
        this.characters = {}; 
        this.battles = {};
        this.battle = null;        
    }

    init(){
        this.resetFields();
        this.loadTeams();

    }

    // load characters from backend and create teams list then call load battles
    loadTeams(){
        this.characters = {};          
        this.teams = [];
        const response = API.getCharacters();
        response.then(function(response){
            for(let index in response){
                let character = response[index];              
                if(character.team.length && !BattleInfo.teams.includes(character.team)){
                    BattleInfo.teams.push(character.team);
                }
            }
            BattleInfo.loadBattles();
        });
    }

    // loads battles from backend and renders battle list
    loadBattles(){
        this.battles = {}; 
        const response = API.getBattles();
        response.then(function(response){
            for(let index in response){
                let battle = response[index];
                BattleInfo.battles[battle.bname] = battle;    
            }
            BattleInfo.renderBattleList();
        });
    };

    // render battle form values
    renderBattleInfo(){
        if (!this.battle) { return; }
        this.validmsg.innerHTML = '';
        this.battleName.value = this.battle.bname;
        this.numberOfBattles.value = this.battle.rounds;
        this.status.value = this.battle.status;

        //rebuild select
        this.participants.options.length = 0; //delete old options
        for (let teamName of this.teams){            
            let pItem = document.createElement('option');
            pItem.text = teamName;
            pItem.value = teamName;
            if(this.battle.teams.includes(teamName)){
                pItem.selected = true;
            }
            this.participants.appendChild(pItem);
        }
    }

    // render list of battles and highlight selected
    renderBattleList(){
        this.battleList.innerHTML = '';
        let tList = document.createElement("ul");
        tList.id = "battlesUL";
        tList.className = "list-group";
        for (let [battleName, battle] of Object.entries(this.battles)){
            let tItem = document.createElement("li");
            if (battleName == this.battle.bname){
                tItem.className = "list-group-item active";
            } else {
                tItem.className = "list-group-item list-group-item-secondary";
            }            
            tItem.innerHTML = battleName;
            tList.appendChild(tItem);
            tItem.onclick = function() {
                BattleInfo.setBattle(battleName);
            };
        }
        this.battleList.appendChild(tList);
        this.renderBattleInfo();
        if (!this.battles.length){
            this.showInfo();
        }
    }

    // in phone mode toggle visibility of list and info    
    showList(){
        this.battleListDiv.classList.remove("isinactive");
        this.battleListDiv.classList.add("isactive");
        this.battleInfoDiv.classList.remove("isactive");
        this.battleInfoDiv.classList.add("isinactive");
    }

    // in phone mode toggle visibility of list and info
    showInfo(){
        this.battleListDiv.classList.remove("isactive");
        this.battleListDiv.classList.add("isinactive");
        this.battleInfoDiv.classList.remove("isinactive");
        this.battleInfoDiv.classList.add("isactive");
    }

    // set active battle and re-render
    setBattle(battleName){
        this.showInfo();
        this.battle = this.battles[battleName];
        SimResults.setBattle(this.battle.bname);
        this.renderBattleList();
    }

    // init new battle values
    resetFields(){
        this.battle = {
            'bname': '',
            'teams': [],
            'rounds': 10,
            'stats': {},
            'status': 'new'
        }
    }

    newBattle(){
        this.resetFields();
        this.renderBattleList();
        SimResults.setBattle(null);
    }

    // delete battle from backend
    deleteBattle(){
        const response = API.deleteBattle(this.battle.bname);
        response.then(function(response){
            BattleInfo.battle = null;
            BattleInfo.resetFields();
            BattleInfo.loadBattles();
            SimResults.setBattle(null);
        });
    }

    // validate battle fields then call backend API to save and start battle
    run(){
        let charExp = new RegExp(/[^A-Za-z0-9 ]/);
        if (charExp.test(this.battleName.value)) {   
            this.validmsg.innerHTML = 'Inavlid characters in battle name.';
            return;
        }
        if (Object.keys(this.battles).includes(this.battleName.value)){
            this.validmsg.innerHTML = 'Battle name is already in use.';
            return;
        }         
        if (this.status.value == 'running' || this.status.value == 'complete'){
            this.validmsg.innerHTML = 'Battle is already running or complete.';
            return;
        }  
        if (this.numberOfBattles.value > 10 || this.numberOfBattles.value < 1){
            this.validmsg.innerHTML = 'Max number of battles is 10. Minimum number of battles is 1.';
            return;
        }     
        this.battle.bname = this.battleName.value;
        this.battle.rounds = this.numberOfBattles.value;
        this.battle.status = this.status.value;
        this.battle.teams = [];
        for(let o of this.participants.options){
            if (o.selected){
                this.battle.teams.push(o.value);
            }
        }
        if (this.battle.teams.length < 2){
            this.validmsg.innerHTML = 'Must select at least two teams.';
            return;
        }

        const response = API.runBattle(this.battle);
        response.then(function(response){
            BattleInfo.loadBattles();
            SimResults.setBattle(BattleInfo.bname);
        });
    }

    // set bname in result tab, hide battle tab and show result tab
    view(){
        if (this.battle){
            SimResults.setBattle(this.battle.bname);
            $("#battleNav").removeClass("ActiveTab");
            $("#battleTab").hide();
            $("#resultNav").addClass("ActiveTab");
            $("#resultTab").show();
        }
    }
}

export const BattleInfo = new Battle();