import {CharacterInfo} from './character.js';

// Backend API class
class APIFunctions {
    constructor (){}
    
    deleteCharacter(cname){
        return fetch("/character/delete?cname="+cname).then(function(response){
            return response.json();
        });
    }
    
    saveCharacter(character){
        return fetch('/character/save', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(character)
        }).then(function(response){
            return response.json();
        });
    }

    getCharacters(){
        return fetch("/characters").then(function(response){
            return response.json();
        });
    }

    saveCharacters(characters){
        return fetch('/characters/save', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(characters)
        }).then(function(response){
            return response.json();
        });
    }

    getBattle(bname){
        return fetch("/battle/load?bname="+bname).then(function(response){
            return response.json();
        });
    }

    getBattles(){
        return fetch("/battles").then(function(response){
            return response.json();
        });
    }

    runBattle(battle){
        return fetch('/battle/run', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(battle)
        }).then(function(response){
            return response.json();
        });
    }

    deleteBattle(bname){
        return fetch("/battle/delete?bname="+bname).then(function(response){
            return response.json();
        });
    }
}

export const API = new APIFunctions();

