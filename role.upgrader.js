// peasant collecting energy resources role
var roleUtils = require('role.utils')

module.exports = {
  run : function(creep, check) {
    if (check) {
      roleUtils.checkLoad(creep)
    }
    // behavior
    if ( creep.memory.working ) {
      if (creep.memory.home && (creep.room.name != creep.memory.home)){
        var door = creep.room.findExitTo(creep.memory.home)
        creep.moveTo(creep.pos.findClosestByRange(door))
      }
      // store resources
      else if (creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
      }
    }
    else {
      // gather resources
      roleUtils.gatherEnergy(creep);
    }
  }, // end run function
  // clean remains of creep
  burry : function(name, spawn) {
    //clean memory left over
    delete Memory.creeps[name];
  }
}
