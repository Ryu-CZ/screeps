// peasant collecting energy resources role
var roleUtils = require('role.utils')

module.exports = {
  run : function(creep, check) {
    if (check) {
      roleUtils.checkLoad(creep)
    }
    // behavior
    if (creep.memory.working) {
      // find closest spawn or extension which is not full
      var storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => ( s.structureType == STRUCTURE_EXTENSION
            || s.structureType == STRUCTURE_SPAWN
            || s.structureType == STRUCTURE_TOWER)
            && s.energy < s.energyCapacity
      });
      if (storage == undefined) {
        storage = creep.room.storage;
      }
      // store resources
      if (storage != undefined && creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(storage);
      }
    }
    else {
      // gather resources
      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source == undefined) {
        //use backup energy source if needed
        source = creep.room.storage;
        if (source && creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(source);
        }
      }
      else if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        // harvest energy if possible
        creep.moveTo(source);
      }
    }
  },
  // end run function
  burry : function(name) {
    //clean memory left over
    delete Memory.creeps[name];
  }
}
