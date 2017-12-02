// creep advance trougth unmapped rooms and claims new one
var roleUtils = require('role.utils')

module.exports = {
  run : function(creep, check) {
    // room orientation first
    if (creep.room.name == creep.memory.target) {
      // try claim controller
      var code = creep.claimController(creep.room.controller)
      if (code == ERR_NOT_IN_RANGE) {
        // move to controller
        creep.moveTo(creep.room.controller);
      }
      else if (code == 0) {
        if (Memory.rooms[creep.memory.home] == undefined) {
          Memory.rooms[creep.memory.home] = {};
        }
        if (Memory.rooms[creep.memory.home].claimed == undefined) {
          Memory.rooms[creep.memory.home].claimed = [];
        }
        Memory.rooms[creep.memory.home].claimed.push(creep.room.name);
      }
    } // end if in target room
    else {
      var door = creep.room.findExitTo(creep.memory.target)
      creep.moveTo(creep.pos.findClosestByRange(door))
    } // end not in target room
  }, // end run function

  // end run function
  burry : function(name, spawn) {
    //clean memory left over
    delete Memory.creeps[name];
  }
};
