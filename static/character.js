import {API} from './backend.js';

//Character Class
class MyCharacter{
    constructor(){
        this.characterList = document.getElementById("CharacterList");
        this.characterListDiv = document.getElementById("CharacterListCard");
        this.characterInfoDiv = document.getElementById("CharacterInfoCard");
        this.characterSearchInput = document.getElementById("characterSearch");
        this.validmsg = document.getElementById('character_v');
        this.characters = [];
        this.character = null;
        this.searchTxt = "";
        document.getElementById("back_to_character_list").onclick = function() {CharacterInfo.showList()};
        document.getElementById("save_button").onclick = function() {CharacterInfo.saveCharacter()};
        document.getElementById("add_button").onclick = function() {CharacterInfo.addCharacter()};
        document.getElementById("delete_button").onclick = function() {CharacterInfo.deleteCharacter()}; 
        this.characterSearchInput.onkeyup = function() {CharacterInfo.search()};        
    }

    init(){
        this.resetFields();
        this.loadCharacterList();
    }

    // filter character list
    search(){
        CharacterInfo.searchTxt = CharacterInfo.characterSearchInput.value;
        CharacterInfo.renderCharacterList();
    }

    // display list of characters, highlight selected and apply search filter
    renderCharacterList(){
        if(this.character == null) this.character = this.characters[0];
        this.characterList.innerHTML = "";
        let cList = document.createElement("ul");
        cList.id = "characterUL";
        cList.className = "list-group";
        for (let c of this.characters){
            //if there is search text and its not in cname
            if (this.searchTxt.length > 0 && 
                !c.cname.toUpperCase().includes(this.searchTxt.toUpperCase())) { 
                    continue; 
            }            

            let cItem = document.createElement("li");
            if (c.cname == this.character.cname){
                cItem.className = "list-group-item active";
            } else {
                cItem.className = "list-group-item list-group-item-secondary";
            }            
            cItem.innerHTML = c.cname;
            cList.appendChild(cItem);
            cItem.onclick = function() {
                CharacterInfo.setCharacter(c, cItem);
            };
        }
        this.characterList.appendChild(cList);        
        this.renderCharacterInfo();
        if (!this.characters.length){
            this.showInfo();
        }
    }

    // render character info fields
    renderCharacterInfo(){
        this.validmsg.innerHTML = "";
        if (this.character){
            document.getElementById("health").value = this.character.health;
            document.getElementById("cname").value = this.character.cname;
            document.getElementById("AC").value = this.character.AC;
            document.getElementById("team").value = this.character.team;
            document.getElementById("strategy").value = this.character.strategy;
            document.getElementById("strength").value = this.character.strength;
        }
    }

    // in phone mode toggle visibility of list and info
    showList(){
        this.characterListDiv.classList.remove("isinactive");
        this.characterListDiv.classList.add("isactive");
        this.characterInfoDiv.classList.remove("isactive");
        this.characterInfoDiv.classList.add("isinactive");

    }

    // in phone mode toggle visibility of list and info
    showInfo(){
        this.characterInfoDiv.classList.remove("isinactive");
        this.characterInfoDiv.classList.add("isactive");
        this.characterListDiv.classList.remove("isactive");
        this.characterListDiv.classList.add("isinactive");
    }

    // set character for character info and make character info visible
    setCharacter(character, listItem){
        this.showInfo();
        this.character = character;
        this.renderCharacterList();
    }

    // load characters from backend and start render
    loadCharacterList(){
        const response = API.getCharacters();
        response.then(function(response){
            CharacterInfo.characters = response;
            CharacterInfo.renderCharacterList();
        });
    }

    // delete character from backend
    deleteCharacter(){
        const response = API.deleteCharacter(this.character.cname);
        response.then(function(response){
            CharacterInfo.character = null;
            CharacterInfo.resetFields();
            CharacterInfo.loadCharacterList();
        });
    }

    // validate character values and save character in the backend
    saveCharacter() {
        let character = {
            'cname': document.getElementById("cname").value,
            'health': document.getElementById("health").value,
            'AC': document.getElementById("AC").value,
            'team': document.getElementById("team").value,
            'strategy': document.getElementById("strategy").value,
            'strength': document.getElementById("strength").value
        }
        //validation
        let charExp = new RegExp(/[^A-Za-z0-9 ]/);
        if (charExp.test(character.cname)) {   
            this.validmsg.innerHTML = 'Inavlid characters in character name.';
            return;
        }
        if (character.health > 300 || character.health < 1){
            this.validmsg.innerHTML = 'Max health is 300. Min health is 1.';
            return;
        }
        if (character.AC > 19 || character.AC < 1){
            this.validmsg.innerHTML = 'Max AC is 19. Min AC is 1.';
            return;
        }
        if (character.strength > 10 || character.strength < 1){
            this.validmsg.innerHTML = 'Max strength is 10. Min strength is 1.';
            return;
        }

        this.character = character;
        const response = API.saveCharacter(this.character);
        response.then(function(response){
            CharacterInfo.character = response;
            CharacterInfo.loadCharacterList();         
        });
    }

    // create initial character values and re-render
    resetFields() {
        this.character = {
            'cname': "",
            'health': 150,
            'AC': 15,
            'team': "",
            'strategy': "random",
            'strength': 3
        }
    }
    addCharacter() {
        this.resetFields();
        CharacterInfo.loadCharacterList();           
    }
}
export const CharacterInfo = new MyCharacter();

