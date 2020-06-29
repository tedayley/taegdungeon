from flask import Flask, request, url_for, redirect
import json
from database import DnDDB
from simulation import Simulation

app = Flask(__name__)

##############################################################################
#                        REST API
##############################################################################
@app.route('/') #root redirect
def index():
    return redirect(url_for('static', filename='simulator.html'))

@app.route('/character/save', methods = ['GET', 'POST'])
def savecharacter():
    character = json.loads(request.data)
    DnDDB.saveCharacter(character)
    return json.dumps(character)

@app.route('/character/delete', methods = ['GET'])
def deletecharacter():
    characterName = request.args.get('cname')
    DnDDB.deleteCharacter(characterName)
    return json.dumps({'result': 'character delete.'})

@app.route('/characters')
def getcharacters():
    characters = DnDDB.loadCharacters()
    return json.dumps(characters)

@app.route('/characters/save', methods = ['GET', 'POST'])
def savecharacters():
    characterList = json.loads(request.data)
    for character in characterList:
        DnDDB.saveCharacter(character)
    return json.dumps({'result': str(len(characterList)) + "characters saved."})

@app.route('/battle/run', methods = ['GET', 'POST'])
def runBattle():
    battle = json.loads(request.data)
    battle['status'] = "running"
    DnDDB.saveBattle(battle)
    sim = Simulation(battle['bname'])
    sim.runSimulation()
    return json.dumps("complete")

@app.route('/battle/delete', methods = ['GET'])
def deleteBattle():
    bname = request.args.get('bname')
    DnDDB.deleteBattle(bname)
    return json.dumps({'result': 'battle delete.'})

@app.route('/battle/load')
def getbattle():
    bname = request.args.get('bname')
    battle = DnDDB.loadBattle(bname)
    return json.dumps(battle)

@app.route('/battles')
def getbattles():
    battles = DnDDB.loadBattles()
    return json.dumps(battles)


if __name__ == '__main__':
    app.run()