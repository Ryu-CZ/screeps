// worker collecting energy resources and conbstruct new structures from it
var roleUtils = require('role.utils')
var roleBuilder = require('role.builder')

module.exports = {
  run : function(creep, check) {
    if (check) {
      roleUtils.checkLoad(creep)
    }
    // behavior
    if (creep.memory.working) {
      var structure = undefined
      if (creep.memory.toRepair == undefined) {
        structure = creep.pos.findClosestByPath(
          FIND_STRUCTURES,
          {
            filter: (s) => s.structureType != STRUCTURE_WALL &&
              s.structureType != STRUCTURE_RAMPART &&
              s.hits < 0.83*s.hitsMax
          });
      }
      else {
        structure = Game.getObjectById(creep.memory.toRepair)
        if (structure == undefined || structure.hits >= structure.hitsMax) {
          structure = undefined
          creep.memory.toRepair = undefined
        }
      }
      if (structure == undefined) {
        // switch to upgrader if there is nothing to build
        roleBuilder.run(creep, false);
      }
      else {
        // remember structure
        creep.memory.toRepair = structure.id
        // repair structure
        if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
          creep.moveTo(structure);
        }
      }
    }
    else {
      // gather resources
      roleUtils.gatherEnergy(creep);
    }
  }, // end run function
  // clean remains of creep
  burry : function(name) {
    //clean memory left over
    delete Memory.creeps[name];
  }
}
