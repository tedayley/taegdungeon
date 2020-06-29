from random import randint
from database import DnDDB

def rollDie(sides=6):
    return randint(1,sides)

class Battle:
    def __init__(self, battleName, logger):
        self.logger = logger
        self.battleInfo = DnDDB.loadBattle(battleName)
        self.teams={}
        self.activePlayers = []

        #create list of teams from character objects
        for tname in self.battleInfo['teams']:
            team = []
            players = DnDDB.loadTeam(tname)
            for player in players:
                character = Character(player, logger)
                team.append(character)
            self.addTeam(tname, team)

    # add message to our logger
    def log(self, msg):
        print(msg)
        if self.logger:
            self.logger(msg)

    # resets players after battle is finished
    def reset(self):
        self.activePlayers = []
        for team in self.teams.keys():     
            self.activePlayers += self.teams[team]     
        for p in self.activePlayers:
            p.reset()

    def addTeam(self, teamName, players):
        self.teams[teamName] = players

    # player died
    def removeActivePlayer(self, player):
        self.activePlayers.remove(player)

    # sort player based on intitiative
    def sort(self):
        self.activePlayers.sort(key = lambda k: k.initiative, reverse = True)

    # determine who to attack based on strategy
    def selectAttackee(self, player):
        if player.strategy == 'berserk':
            return self.berserkerRage(player)
        if player.strategy == 'health':
            return self.selectHealthiest(player)
        return self.selectRandomAttack(player)

    # select the healthiest player on another team
    def selectHealthiest(self, player):
        maxHealth = 0
        attackee = None
        for p in self.activePlayers:
            if p.team != player.team:
                averageHealth = p.health/p.OGhealth
                if averageHealth > maxHealth:
                    maxHealth = averageHealth
                    attackee = p
        return attackee

    # attach who attached you last
    def berserkerRage(self,player):
        if player.lastAttacker and player.lastAttacker in self.activePlayers:
            return player.lastAttacker
        return self.selectRandomAttack(player)

    # hit random player on other team
    def selectRandomAttack(self, player):
        attackteam = player.team
        while attackteam == player.team:
            x = randint(0,len(self.activePlayers)-1)
            attackee = self.activePlayers[x]
            attackteam = attackee.team
        return attackee

    # victory when only one team remains
    def isVictory(self):
        team = self.activePlayers[0].team
        for p in self.activePlayers:
            if team != p.team:
                return False
        return True

    # start new battle       
    def runBattle(self):
        self.reset()                
        for p in self.activePlayers:
            p.rollInitiative()
        self.sort()
        while not self.isVictory():
            for p in self.activePlayers:
                attackee = self.selectAttackee(p)
                result = p.attack(attackee)            
                if result == True:
                    self.removeActivePlayer(attackee)
                if self.isVictory():
                    break
        self.log("{} team wins!!!!!".format(self.activePlayers[0].team))

class Character:
    def __init__(self, cData, logger):
        self.name = cData['cname']
        self.ac = int(cData['AC'])
        self.team = cData['team']
        self.strength = int(cData['strength'])
        self.OGhealth = int(cData['health'])
        self.health = self.OGhealth
        self.strategy = cData['strategy']
        self.initiative = 0 
        self.attackdice = [12,6]
        self.lastAttacker = None
        self.kills = 0
        self.hits = 0
        self.logger = logger

    # add log message to logger
    def log(self, msg):
        print(msg)
        if self.logger:
            self.logger(msg)

    # init stats after battle
    def reset(self):
        self.health = self.OGhealth
        self.hits = 0
        self.kills = 0

    # get player initiative value
    def rollInitiative(self):
        self.initiative = rollDie(20)
        self.log("{} rolled initiative {}".format(self.name, self.initiative))

    # hit if attack is greater than armor class
    def doesHit(self, attackee):
        hit = rollDie(20) + self.strength
        if hit > attackee.ac:
            attackee.lastAttacker = self
            return True
        else:
            return False

    # get attack value
    def rollAttackDie(self, attackee):
        for number in self.attackdice:
            attack = rollDie(number)
            attackee.health -= attack
            self.log("{} damaged {} for {}. health {}/{}".format(self.name, attackee.name, attack, attackee.health, attackee.OGhealth))
            if attackee.health < 1:
                self.log("{} killed {}.".format(self.name, attackee.name))
                self.kills += 1
                return True
        else:
            return False

    # attack another player
    def attack(self, attackee):
        if self.doesHit(attackee):
            self.log("{} hit {}".format(self.name, attackee.name))
            result = self.rollAttackDie(attackee)
            self.hits += 1
            return result
        else:
            self.log("{} misses {}".format(self.name, attackee.name))
        return False

class Simulation:
    def __init__(self, battleName):        
        self.battle = Battle(battleName, self.logger)
        self.rounds = int(self.battle.battleInfo['rounds'])
        self.stats = {'teamWins': {},
                      'players': {}}
        self.messages = []
        self.status = ""

    def logger(self, msg):
        self.messages.append(msg)
        #self.saveBattle()
    
    # add log message to logger
    def log(self, msg):
        print(msg)
        if self.logger:
            self.logger(msg)

    # saves battle to database
    def saveBattle(self):
        battleData = {"bname": self.battle.battleInfo['bname'], 
            "teams": self.battle.battleInfo['teams'], 
            "rounds": self.battle.battleInfo['rounds'], 
            "stats": self.stats, 
            "status": self.status,
            "messages": self.messages
        }
        DnDDB.saveBattle(battleData)

    # intitializes the team and player stats
    def initStats(self):
        for team in self.battle.teams.keys():
            self.stats['teamWins'][team] = 0
        for teamName in self.battle.teams:
            team = self.battle.teams[teamName]
            for p in team:
                self.stats['players'][p.name] = {'team': teamName,
                                                 'wins': 0,
                                                 'kills': 0,
                                                 'hits': 0}

    # updates team and player stats after battle
    def updateStats(self):
        winningTeam = self.battle.activePlayers[0].team
        self.stats['teamWins'][winningTeam] += 1
        for p in self.battle.activePlayers:
            self.stats['players'][p.name]['wins'] += 1
        for teamName in self.battle.teams:
            team = self.battle.teams[teamName]
            for p in team:
                self.stats['players'][p.name]['kills'] += p.kills
                self.stats['players'][p.name]['hits'] += p.hits

    # runs the simulation for x number of battles
    def runSimulation(self):
        self.status = "running"
        self.initStats()
        for x in range(self.rounds):
            self.log("-----Round {}-----".format(x+1))
            self.battle.runBattle()
            self.updateStats()
        self.log("Simulation Complets")
        self.status = "complete"
        self.saveBattle()


if __name__== "__main__":
    pass