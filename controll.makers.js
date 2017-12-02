// Cares about birth controll and corpse desolving
require('prototype.spawn')();
var roleMiner = require('role.miner')
var roleProspector = require('role.prospector')

module.exports = {
  /** @param {Spawn} spawn*/
  run : function(spawn) {
    if (!(spawn.memory.installed)) {
      // setup new spawn
      console.log('Initializing core: ' + spawn.name)
      spawn.install();
    }
    // count my creeps
    let roomCreeps = spawn.room.find(FIND_MY_CREEPS);
    var harvestersCount = _.sum(roomCreeps, (c) => c.memory.role == 'harvester')
    var upgradersCount = _.sum(roomCreeps, (c) => c.memory.role == 'upgrader')
    var buildersCount = _.sum(roomCreeps, (c) => c.memory.role == 'builder')
    var repairersCount = _.sum(roomCreeps, (c) => c.memory.role == 'repairer')
    var wallersCount = _.sum(roomCreeps, (c) => c.memory.role == 'waller')
    var minersCount = _.sum(roomCreeps, (c) => c.memory.role == 'miner')
    var carriesCount = _.sum(roomCreeps, (c) => c.memory.role == 'carry')
    var energy = spawn.room.energyCapacityAvailable;
    var name = undefined;
    // primal check if there is emergency in production line
    if (spawn.room.storage == undefined) {
      if ( harvestersCount == 0 && (minersCount == 0 || carriesCount == 0)) {
        if (minersCount) {
          name = spawn.createCarry(spawn.room.energyAvailable)
        }
        else {
          name = spawn.createCustomCreep(
              spawn.room.energyAvailable,
              'harvester');
        }
      }
    }
    else if (0 == (harvestersCount + carriesCount)) {
      if ( minersCount > 0 || spawn.room.storage[RESOURCE_ENERGY] >= 700) {
        name = spawn.createCarry(150);
      }
      else { // harvestersCount + carriesCount + minersCount = 0
        // create harvester because it can work on its own
        name = spawn.createCustomCreep(
            spawn.room.energyAvailable,
            'harvester');
      }
    } // finished primal emergency check
    else {
      // first try create miner for free mining post
      for (let c in spawn.room.memory.containers) {
        if (spawn.room.memory.containers[c].isFree) {
          name = spawn.createMiner(c, spawn.room.memory.containers[c].sourceId);
          if (!(name < 0)) {
            break;
          }
        }
      }
      if (name == undefined) {
        if (harvestersCount < spawn.memory.minHarvesters) {
          // try harvesters
          name = spawn.createCustomCreep(energy, 'harvester');
        }
        else if (carriesCount < spawn.memory.minCarries) {
          // try carryier
          name = spawn.createCarry(300);
        }
        else if (spawn.memory.claimRoom != undefined) {
          // try make claimer
          name = spawn.createClaimer(spawn.memory.claimRoom)
          if (!(name < 0) && name != undefined) {
            delete spawn.memory.claimRoom;
          }
          else { // notify error
            console.log("Cailmer creation  failed: " + name)
          }
        }
        else if (upgradersCount < spawn.memory.minUpgraders) {
          // upgrader
          name = spawn.createCustomCreep(energy, 'upgrader');
        }
        else if (repairersCount < spawn.memory.minRepairers) {
          // try rapairer
          name = spawn.createCustomCreep(energy, 'repairer');
        }
        else if (buildersCount < spawn.memory.minBuilders ) {
          // try builder
          name = spawn.createCustomCreep(energy, 'builder');
        }
        else if (wallersCount < spawn.memory.minWallers) {
          // try builder
          name = spawn.createCustomCreep(energy, 'waller');
        }
        else { // try colonize other rooms as planed
          for (var room in spawn.memory.colonies) {
            for (var source in spawn.memory.colonies[room]){
              if (spawn.memory.colonies[room][source].prospectors < spawn.memory.colonies[room][source].minProspectors) {
                name = spawn.createProspector(
                  energy,
                  spawn.memory.colonies[room][source].workParts,
                  spawn.room.name,
                  room,
                  source);
                if (!(name < 0)) {
                  spawn.memory.colonies[room][source].prospectors += 1;
                  break;
                }
              } // if prospectors < minProspectors
            } // loop souces
          } // loop colonies
          if (name == undefined && buildersCount < spawn.memory.maxBuilders) { // default option to spawn
            // try default creep : builder
            name = spawn.createCustomCreep(energy, 'builder');
          } // default option to spawn
        } // else
      } // if (name == undefined)
    } // spawning
    // clear dead creeps
    for (let c in Memory.creeps) {
      if (Game.creeps[c] == undefined) {
        console.log("Desolving creep: " + c + "(" + Memory.creeps[c].role + ")");
        if (Memory.creeps[c].role == 'miner') {
          roleMiner.burry(c, spawn);
        }
        else if (Memory.creeps[c].role == 'prospector') {
          roleProspector.burry(c);
        }
        delete Memory.creeps[c];
        console.log("Miner: " + minersCount);
        console.log("Carries: " + carriesCount);
        console.log("Harvesters: " + harvestersCount);
        console.log("Upgraders: " + upgradersCount);
        console.log("Builders: " + buildersCount);
        console.log("Repairers: " + repairersCount);
        console.log("Wallers: " + wallersCount);
        // console.log("Pioneers: " + pioneersCount);
        // console.log("Raiders: " + raidersCount);
      }
    }
    if (!(name < 0) && name != undefined) {
      console.log("Spawned new creep: " + name + "(" + Game.creeps[name].memory.role + ")");
      console.log("Miner: " + minersCount);
      console.log("Carries: " + carriesCount);
      console.log("Harvesters: " + harvestersCount)
      console.log("Upgraders: " + upgradersCount)
      console.log("Builders: " + buildersCount)
      console.log("Repairers: " + repairersCount)
      console.log("Wallers: " + wallersCount);
      // console.log("Pioneers: " + pioneersCount);
      // console.log("Raiders: " + raidersCount);
    }
  }
};
