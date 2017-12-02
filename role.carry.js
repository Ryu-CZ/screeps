// peasant moving energy resources around map
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
                            || s.structureType == STRUCTURE_TOWER
                          ) && s.energy < s.energyCapacity
          }
      );
      if (storage == undefined && creep.room.memory.upgradeContainerId != undefined)  {
        storage = Game.getObjectById(creep.room.memory.upgradeContainerId);
        if (storage.store[RESOURCE_ENERGY] >= storage.storeCapacity) {
          storage = undefined;
        }
      }
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
      let container = creep.pos.findClosestByPath(
          FIND_STRUCTURES,
          {filter: (s) => ( s.structureType == STRUCTURE_CONTAINER
            && s.store[RESOURCE_ENERGY] > 12 // creature could do 1 step to other source because miner do 10/tick
            && s.id != creep.room.memory.upgradeContainerId)}
          );
      if (container != undefined) {
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(container);
        }
      }
      else if ( creep.memory.pickTick < 0 ) {
        var dropenergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                  filter: (d) => d.amount >= 62
              });
        if (dropenergy == undefined) {
          creep.memory.pickTick = 9
        }
        else {
          if (creep.pickup(dropenergy) == ERR_NOT_IN_RANGE) {
            creep.moveTo(dropenergy)
          }
        }
      }
      else {
        creep.memory.pickTick -= 1
        // withdraw resource storage if any
        container = creep.room.storage;
        if (container && creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(container);
        }
      } // end withdraw storage
    } // end gather energy
  } // run : function(creep, check)
}; // end module.exports
