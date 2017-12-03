// universal creep: able to build, repair and advance trougth unmapped rooms
var roleUtils = require('role.utils')

module.exports = {
  run : function(creep, check) {
    if (check) {
      roleUtils.checkLoad(creep)
    }
    // behavior
    if (creep.memory.working) {
      // room orientation first
      if (creep.room.name == creep.memory.home) { // I am home
        // find closest spawn or extension which is not full
        var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (s) => ( s.structureType == STRUCTURE_EXTENSION
              || s.structureType == STRUCTURE_SPAWN
              || s.structureType == STRUCTURE_TOWER
              || (s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < s.storeCapacity))
              && s.energy < s.energyCapacity
            })
        if (storage == undefined) {
            storage = creep.room.storage
        }
        // store resources
        if (storage != undefined && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(storage);
        }
      } // end - (creep.room.name == creep.memory.home)
      else { // I am in foreign room
        // try build new constructs
        var constuctionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
        if (constuctionSite == undefined) { // there is nothing to build here
          // try repaire exisitng structures
          constuctionSite = creep.pos.findClosestByPath(
            FIND_STRUCTURES,
            {filter: (s) => s.hits < 0.62*s.hitsMax && s.structureType != STRUCTURE_WALL}
            )
          if (constuctionSite == undefined) { // nothing to repaire
            // move to home -> switch to traveling harvester
            var door = creep.room.findExitTo(creep.memory.home)
            creep.moveTo(creep.pos.findClosestByRange(door))
          }
          else { // repair structure
            if (creep.repair(constuctionSite) == ERR_NOT_IN_RANGE) {
              creep.moveTo(constuctionSite);
            }
          }
        } // end building try
        else {
          // build construct
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
          creep.memory.working = true;
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
    //clean memory left over
    delete Memory.creeps[name];
  }
};
