import {API} from './backend.js';

// results class
class Results{
    constructor(){
        this.battleMessagesText = document.getElementById("battle_messages");
        this.playerStatsTable = document.getElementById("player_stats");
        this.teamStatsTable = document.getElementById("team_stats");
        this.simulationHead = document.getElementById("simulationHead");
        this.statChart = document.getElementById('StatChart');
        
        this.battleInfo = null;
        this.battleName = null;
    }

    init(){
        this.initResultChart();            
        this.loadBattleInfo();
    }

    // load battle battle info from backend API
    loadBattleInfo(){   
        this.battleInfo = null;  
        this.initResultChart();   
        if(this.battleName != null){
            const response = API.getBattle(this.battleName);
            response.then(function(response){
                SimResults.battleInfo = response;
                SimResults.renderBattleInfo();
            });
        } else {
            this.renderBattleInfo();
        }
    }

    // render player and team tables
    renderBattleInfo(){
        this.battleMessagesText.value = ""
        this.simulationHead.innerHTML = "Simulation: " + this.battleName;
        this.teamStatsTable.innerHTML = "";
        this.playerStatsTable.innerHTML = "";
        
        if (!this.battleInfo){
            return;
        }

        for (let [teamName, teamWins] of Object.entries(this.battleInfo.stats.teamWins)){
            let tRow = document.createElement("tr");
            tRow.className = "bg-primary";
            let tdName = document.createElement("td");
            tdName.innerHTML = teamName;
            let tdWins = document.createElement("td");
            tdWins.innerHTML = teamWins;
            tRow.appendChild(tdName);            
            tRow.appendChild(tdWins);
            this.teamStatsTable.appendChild(tRow);
        }

        for (let [playerName, playerStats] of Object.entries(this.battleInfo.stats.players)){
            let tRow = document.createElement("tr");
            tRow.className = "bg-success";
            let tdName = document.createElement("td");
            tdName.innerHTML = playerName;
            let tdTeam = document.createElement("td");
            tdTeam.innerHTML = playerStats.team;
            let tdHits = document.createElement("td");
            tdHits.innerHTML = playerStats.hits;
            let tdKills = document.createElement("td");
            tdKills.innerHTML = playerStats.kills;
            let tdWins = document.createElement("td");
            tdWins.innerHTML = playerStats.wins;
            tRow.appendChild(tdName);            
            tRow.appendChild(tdTeam);           
            tRow.appendChild(tdHits);           
            tRow.appendChild(tdKills);           
            tRow.appendChild(tdWins);
            this.playerStatsTable.appendChild(tRow);
        }
        this.renderBattleDetails();
    }

    // render battle details text area
    renderBattleDetails(){
        let msgTxt = "";
        for(let x = this.battleInfo.messages.length-1; x >= 0; x--){
            msgTxt += this.battleInfo.messages[x] + "\n";
        }
        this.battleMessagesText.value = msgTxt;

        this.renderChart();
    }

    // create new chart chart
    initResultChart(){
        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        this.statChart.innerHTML = "";
        this.statChart.appendChild(canvas);
        this.myChart = new Chart(context, {
            type: 'horizontalBar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Hits',
                    backgroundColor: 'blue',
                    data: [],
                    borderWidth: 1
                },
                {
                    label: 'Kills',
                    backgroundColor: 'red',
                    data: [],
                    borderWidth: 1
                },
                {
                    label: 'Wins',
                    backgroundColor: 'green',
                    data: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero:true,
                            fontFamily: "'Open Sans Bold', sans-serif",
                            fontSize:11
                        },
                        scaleLabel:{
                            display:false
                        },
                        gridLines: {
                        }, 
                        stacked: true
                    }],
                    yAxes: [{
                        gridLines: {
                            display:false,
                            color: "#fff",
                            zeroLineColor: "#fff",
                            zeroLineWidth: 0
                        },
                        ticks: {
                            fontFamily: "'Open Sans Bold', sans-serif",
                            fontSize:11
                        },
                        stacked: true
                    }],
                    legend:{
                        display:false
                    },
                }
            }
        });
    }

    // render current chart details
    renderChart(){
        let cLabels = [];
        let cHits = [];
        let cKills = [];
        let cWins = [];
        for (let [playerName, playerStats] of Object.entries(this.battleInfo.stats.players)){            
            cLabels.push(playerName);
            cHits.push(Math.ceil(playerStats.hits/10));
            cKills.push(playerStats.kills);
            cWins.push(playerStats.wins);
        }
        this.myChart.data = {
            labels: cLabels,
            datasets: [{
                label: 'Hits',
                backgroundColor: 'blue',
                data: cHits,
                borderWidth: 1
            },
            {
                label: 'Kills',
                backgroundColor: 'red',
                data: cKills,
                borderWidth: 1
            },
            {
                label: 'Wins',
                backgroundColor: 'green',
                data: cWins,
                borderWidth: 1
            }]
        }
        this.myChart.update();
    }

    // set current battle name and cal load battle info
    setBattle(bname){
        this.battleName = bname;            
        this.loadBattleInfo();
    }
}

export const SimResults = new Results();