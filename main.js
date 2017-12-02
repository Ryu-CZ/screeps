// manin game loop
require('prototype.spawn')();
var roleHarvester = require('role.harvester')
var roleUpgrader = require('role.upgrader')
var roleBuilder = require('role.builder')
var roleProspector = require('role.prospector')
var roleRepairer = require('role.repairer')
var roleWaller = require('role.waller')
var roleRaider = require('role.raider')
var roleClaimer = require('role.claimer')
var roleMiner = require('role.miner')
var roleCarry = require('role.carry')
var controllDefence = require('controll.defence')

module.exports.loop = function() {
  // for each spawn
  for (let spawnName in Game.spawns) {
     // run spawn logic
     Game.spawns[spawnName].breed();
  }
  controllDefence.run()

  for (let name in Game.creeps) {
    var creep = Game.creeps[name];
    if (creep.memory.role == 'prospector') {
      roleProspector.run(creep, true);
    }
    else if (creep.memory.role == 'carry') {
      roleCarry.run(creep, true);
    }
    else if (creep.memory.role == 'miner') {
      roleMiner.run(creep, true);
    }
    else if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep, true);
    }
    else if (creep.memory.role == 'builder') {
      roleBuilder.run(creep, true);
    }
    else if (creep.memory.role == 'repairer') {
      roleRepairer.run(creep, true);
    }
    else if (creep.memory.role == 'waller') {
      roleWaller.run(creep, true);
    }
    else if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep, true);
    }
    else if (creep.memory.role == 'raider') {
      roleRaider.run(creep, true);
    }
    else if (creep.memory.role == 'claimer') {
      roleClaimer.run(creep, true);
    }
  } // end for
};
