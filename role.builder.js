// worker collecting energy resources and conbstruct new structures from it
var roleUtils = require('role.utils')
var roleUpgrader = require('role.upgrader')

module.exports = {
  run : function(creep, check) {
    if (check) {
      roleUtils.checkLoad(creep)
    }
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
      var door = creep.room.findExitTo(creep.memory.target)
      creep.moveTo(creep.pos.findClosestByRange(door))
    }
    // behavior
    if (creep.memory.working) {
      var constuctionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
      if (constuctionSite == undefined) {
        // switch to upgrader if there is nothing to build
        roleUpgrader.run(creep, creep.room.controller, false);
      }
      else {
        // build construct
        if (creep.build(constuctionSite) == ERR_NOT_IN_RANGE) {
          creep.moveTo(constuctionSite);
        }
      }
    }
    else {
      // gather resources
      roleUtils.gatherEnergy(creep);
    }
  },
  // end run function
  burry : function(name) {
    //clean memory left over
    delete Memory.creeps[name];
  }
};
