window.onload=initDungeon

// import tab classes
import {CharacterInfo} from './character.js';
import {TeamInfo} from './team.js';
import {BattleInfo} from './battleprep.js';
import {SimResults} from './results.js';

// jQuery objects for nav and tab elements
const charTab = $("#charTab");
const charNav = $("#charNav");
const teamTab = $("#teamTab");
const teamNav = $("#teamNav");
const battleTab = $("#battleTab");
const battleNav = $("#battleNav");
const resultTab = $("#resultTab");
const resultNav = $("#resultNav");

// initializ all classes and nav bar
function initDungeon(){
    CharacterInfo.init();
    TeamInfo.init();
    BattleInfo.init();
    SimResults.init();
    initNavBar();
}

// add click functions to nav tabs
function initNavBar(){
    charNav.click( function() {setTab("character")});
    teamNav.click( function() {setTab("team")});
    battleNav.click( function() {setTab("battle")});
    resultNav.click( function() {setTab("result")});
}

// hide tabs and show clicked tab
function setTab(tab){
    charNav.removeClass("ActiveTab");
    teamNav.removeClass("ActiveTab");
    battleNav.removeClass("ActiveTab");
    resultNav.removeClass("ActiveTab");
    charTab.hide();
    teamTab.hide();
    battleTab.hide();
    resultTab.hide();
    if(tab == "character"){
        charNav.addClass("ActiveTab");
        CharacterInfo.init();
        charTab.show();
    } else if(tab == "team"){
        teamNav.addClass("ActiveTab");
        TeamInfo.init();
        teamTab.show();
    } else if(tab == "battle"){
        battleNav.addClass("ActiveTab");
        BattleInfo.init();
        battleTab.show();
    } else if(tab == "result"){
        resultNav.addClass("ActiveTab");
        SimResults.init();
        resultTab.show();
    }
}
