// creep advance trougth unmapped rooms and reserves new room

module.exports = {
  run : function(creep, check=null) {
    // room orientation first
    if (this.memory.working) {
      if(creep.room.name == creep.memory.target) {
        // try reserve controller
        if (creep.room.controller.reservation == undefined || 4996 < creep.room.controller.reservation.ticksToEnd){
         if (creep.reserveController(creep.room.controller)) {
            // move to controller
            creep.moveTo(creep.room.controller);
          }
        }
        else {
          Memory.spawns[creep.memory.spawn].colonies[creep.room.name].reserve = false;
          this.memory.working = false;
        }
      } // end if in target room
      else {
        var door = creep.room.findExitTo(creep.memory.target);
        creep.moveTo(creep.pos.findClosestByPath(door));
      } // end not in target room
    }
    else if (Memory.spawns[creep.memory.spawn].colonies[creep.room.name].reserve) {
      this.memory.working = true;
    }
  }, // end run function

  // end run function
  burry : function(name) {
    //clean memory left over
    Memory.spawns[emory.creeps[name].memory.spawn].colonies[Memory.creeps[name].target].reservant = null;
    delete Memory.creeps[name];

  }
};
