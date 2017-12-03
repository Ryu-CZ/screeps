// universal creep: able to build, repair and advance trougth unmapped rooms
var roleUtils = require('role.utils')

module.exports = {
  run : function(creep, check) {
    if (check) {
      roleUtils.checkLoad(creep)
    }
    // behavior
    // //emergency evacuation
    // if (creep.hits < creep.hitsMax) {
    //   if (creep.room.name == creep.memory.home) {
    //     creep.moveTo(creep.room.controller);
    //     creep.memory.working = creep.carry.energy > 0;
    //   }
    //   else {
    //     var door = creep.room.findExitTo(creep.memory.home);
    //     creep.moveTo(creep.pos.findClosestByRange(door));
    //   }
    // }
    // else
    if (creep.memory.working) {
      // room orientation first
      if (creep.room.name == creep.memory.home) { // I am home
        // find closest spawn or extension which is not full
        var storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => (
              ((
                (s.structureType == STRUCTURE_EXTENSION
                  || s.structureType == STRUCTURE_SPAWN
                  || s.structureType == STRUCTURE_TOWER
                )&& s.energy < s.energyCapacity )
              ) || (
                (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE )
                && (_.sum(s.store) < s.storeCapacity)
              )
            )
          })

        if (storage == undefined ) {
            storage = creep.room.storage
        }
        // store resources
        if (storage != undefined && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(storage);
        }
      } // end - (creep.room.name == creep.memory.home)
      else { // I am in foreign room
        // try construct something
        var constuctionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        // there is nothing to build here
        if (constuctionSite == undefined) {
          // try repaire exisitng structures
          var structure;
          if (_.isString(creep.memory.toRepair)) {
            structure = Game.getObjectById(creep.memory.toRepair);
            if (structure != undefined && structure.hits == structure.hitsMax) {
              structure = undefined;
              creep.memory.toRepair = undefined;
            }
          }
          if (structure == undefined) {
            structure = creep.pos.findClosestByPath(
              FIND_STRUCTURES,
              {filter: (s) => s.hits < 0.62*s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART}
            );
          }
          if (structure == undefined) { // nothing to repaire
            // move to home -> switch to traveling harvester
            var door = creep.room.findExitTo(creep.memory.home)
            creep.moveTo(creep.pos.findClosestByRange(door))
          }
          else { // repair structure
            creep.memory.toRepair = structure.id;
            if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
              creep.moveTo(structure);
            }
          }
        } // end repair search try
        // build construct
        else {
          if (creep.build(constuctionSite) == ERR_NOT_IN_RANGE) {
            creep.moveTo(constuctionSite);
          }
        } // end building

      } // end foreign room
    } // end if creep is working
    else {
      // room orientation first
      if (creep.room.name == creep.memory.target) {
        // gather resources
        var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceIdx];
        var code = creep.harvest(source)
        if (code == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
        else if (code == ERR_NOT_ENOUGH_RESOURCES) {
          if (creep.energy >= (0.62 * creep.energyCapacity) && (114 < source.ticksToRegeneration)) {
            creep.memory.working = true;
          }
          else {
            // waiting to renew
            creep.moveTo(source);
          }
        }
      } // end if in target room
      else {
        var door = creep.room.findExitTo(creep.memory.target)
        creep.moveTo(creep.pos.findClosestByRange(door))
      } // end not in target room
    } // end not working
  }, // end run function
  // clean remains of creep
  burry : function(name) {
    // update my spawn prospector statistics
    Memory.spawns[Memory.creeps[name].spawn].colonies[Memory.creeps[name].target][Memory.creeps[name].sourceIdx].prospectors -= 1
    //clean memory left over
    delete Memory.creeps[name];
  }
};
