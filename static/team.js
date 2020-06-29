import {API} from './backend.js';

//Team Class
class MyTeam{
    constructor(){
        this.teamList = document.getElementById("TeamList");
        this.teamNameInput = document.getElementById("tname");
        this.teamPlayerList = document.getElementById("teamplayers");
        this.teamListDiv = document.getElementById("TeamListCard");
        this.teamInfoDiv = document.getElementById("TeamInfoCard");
        this.validmsg = document.getElementById('team_v');
        this.characters = [];
        this.teams = [];
        this.teamName = null; 
        this.originalPlayers = [];
        document.getElementById("back_to_team_list").onclick = function() {TeamInfo.showList()};
        document.getElementById("save_team").onclick = function() {TeamInfo.saveTeam()};     
        document.getElementById("new_team").onclick = function() {TeamInfo.newTeam()};     
    }

    init(){
        this.loadPlayers();
    }

    // load characters from back end, create team list and render tab
    loadPlayers(){
        this.characters = {};          
        this.teams = [];
        const response = API.getCharacters();
        response.then(function(response){
            for(let index in response){
                let character = response[index];
                TeamInfo.characters[character.cname] = character;              
                if(!TeamInfo.teams.includes(character.team) && character.team != ""){
                    TeamInfo.teams.push(character.team);
                }
            }
            TeamInfo.renderTeamList();
        });
    }

    // refresh players in player <select>
    renderPlayers(){
        this.originalPlayers = [];
        
        //rebuild select
        this.teamPlayerList.options.length = 0; //delete old options
        for (let [cname, character] of Object.entries(this.characters)){            
            let pItem = document.createElement("option");
            pItem.text = character.cname;
            pItem.value = character.cname;
            if(character.team == this.teamName){
                pItem.selected = true;
                this.originalPlayers.push(character.cname);
            }
            this.teamPlayerList.appendChild(pItem);
        }
    }

    // render list of teams, highlight active team,  and call render players
    renderTeamList(){
        this.teamList.innerHTML = "";
        let tList = document.createElement("ul");
        tList.id = "teamsUL";
        tList.className = "list-group";
        for (let teamName of this.teams){
            let tItem = document.createElement("li");
            if ( teamName == this.teamName){
                tItem.className = "list-group-item active";
            } else {
                tItem.className = "list-group-item list-group-item-secondary";
            }            
            tItem.innerHTML = teamName;
            tList.appendChild(tItem);
            tItem.onclick = function() {
                TeamInfo.setTeam(teamName);
            };
        }
        this.teamList.appendChild(tList);
        this.renderPlayers();

        if(!this.teams.length){
            this.showInfo();
        }
    }

    // initialize new team values
    newTeam(){
        this.teamName = "<new team>";
        this.teamNameInput.value = this.teamName;
        this.renderPlayers();
    }

    // in phone mode toggle visibility of list 
    showList(){
        this.teamListDiv.classList.remove("isinactive");
        this.teamListDiv.classList.add("isactive");
        this.teamInfoDiv.classList.remove("isactive");
        this.teamInfoDiv.classList.add("isinactive");
    }

     // in phone mode toggle visibility of info
     showInfo(){
        this.teamListDiv.classList.remove("isactive");
        this.teamListDiv.classList.add("isinactive");
        this.teamInfoDiv.classList.remove("isinactive");
        this.teamInfoDiv.classList.add("isactive");
    }   

    // set active team and renders info
    setTeam(teamName){
        this.showInfo();
        this.teamNameInput.value = teamName;
        this.teamName = teamName;
        this.renderTeamList();
    }

    // validate team form values and save to backend
    saveTeam(){
        let charExp = new RegExp(/[^A-Za-z0-9 ]/);
        if (charExp.test(this.teamNameInput.value)) {   
            this.validmsg.innerHTML = 'Inavlid characters in team name.';
            return;
        }
        this.teamName = this.teamNameInput.value;
        let characterList = [];
        for(let o of this.teamPlayerList.options){
            if (o.selected){
                this.characters[o.value].team = this.teamName;
                characterList.push(this.characters[o.value]);
            } else if(this.originalPlayers.includes(o.value)){
                this.characters[o.value].team = "";
                characterList.push(this.characters[o.value]);
            }
        }
        if (characterList.length < 1) {   
            this.validmsg.innerHTML = 'Must select at least one character.';
            return;
        }
        const response = API.saveCharacters(characterList);
        response.then(function(response){
            TeamInfo.loadPlayers();
        });
    }
}

export const TeamInfo = new MyTeam();