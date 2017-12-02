// set of general functions for other roles

module.exports = {
  // alter memory.working based on carry load
  checkLoad : function(creep) {
    // alter memory based on carry load
    if (creep.memory.working && creep.carry.energy == 0) {
      creep.memory.working = false;
    }
    else if (!(creep.memory.working) && creep.carry.energy >= creep.carryCapacity) {
      creep.memory.working = true;
    }
  }, // end checkLoad

  // finds nearest container with energy and withdraw some
  gatherEnergy : function (creep) {
    const noticeCapacity = Math.floor(0.38*creep.carryCapacity);
    // gather resources
    let container = creep.pos.findClosestByPath(
      FIND_STRUCTURES,
      {filter: (s) => 
        ( s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
        && s.store[RESOURCE_ENERGY] > noticeCapacity}
      );
    if (container != undefined) {
      creep.memory.pickTick = 7;
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
      else { // pick up fropped energy
        if (creep.pickup(dropenergy) == ERR_NOT_IN_RANGE) {
          console.log(creep.name + " finding drops")
          creep.moveTo(dropenergy)
        }
      }
    }
    else {
      // find resource to mine as fallback
      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (source == undefined) {
        creep.memory.pickTick -= 1
      }
      else if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.memory.pickTick -= 1
        creep.moveTo(source);
      }
    }
  } // end gatherEnergy
};
