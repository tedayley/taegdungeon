from pymongo import MongoClient

class DnDDBAccess:
    def __init__(self):
        # connect to local MongoDB
        # self.client = MongoClient("mongodb://localhost:27017/admin")
        # connect to live MongoDB
        self.client = MongoClient("mongodb+srv://taeg:####@cluster0-gmcbw.mongodb.net/dungeon?retryWrites=true&w=majority")

        # get database from client connection
        self.DnDDB = self.client.dungeon

        # get collections
        self.characters = self.DnDDB["characters"]
        self.battles = self.DnDDB["battles"]

    def initCharacterCollection(self):
        self.characters.drop()

    def loadCharacter(self, characterName):
        c = self.characters.find_one({'cname': characterName})
        return c
    
    def saveCharacter(self, characterData):
        # use upsert to create new character if one doesn't exist
        self.characters.replace_one({"cname": characterData["cname"]}, characterData, upsert=True) 

    def insertCharacter(self, characterData):
        self.characters.insert_one(characterData)

    def deleteCharacter(self, characterName):
        self.characters.delete_one({"cname": characterName})

    def loadCharacters(self):
        all = self.characters.find({}, {'_id': False})
        return list(all)

    def loadTeam(self, tname):
        team = self.characters.find({'team': tname}, {'_id': False})
        return list(team)

    def saveBattle(self, battleData):
        self.battles.replace_one({'bname': battleData['bname']}, battleData, upsert=True)

    def deleteBattle(self, bname):
        self.battles.delete_one({'bname': bname})

    def loadBattle(self, bname):
        c = self.battles.find_one({'bname': bname}, {'_id': False})
        return c

    def loadBattles(self):
        all = self.battles.find({}, {'_id': False, 'stats': False, 'messages': False})
        return list(all)  

DnDDB = DnDDBAccess()

if __name__== "__main__":
    DnDDB.battles.drop()
    battle = {
        'bname': 'ha',
        'teams': ['human','computer'],
        'rounds': 10,
        'stats': {},
        'status': 'running'
    }
    DnDDB.saveBattle(battle)
    battle = {
        'bname': 'blah',
        'teams': ['jaw','hurts'],
        'rounds': 10,
        'stats': {},
        'status': 'complete'
    }
    DnDDB.saveBattle(battle)
    all = DnDDB.loadBattles()
    print (all)
    b = DnDDB.loadBattle('blah')
    print(b)
