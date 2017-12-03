module.exports = {
  // simply mine energy
  run : function(creep) {
    var source = Game.getObjectById(creep.memory.sourceId);
    if (creep.memory.landed) {
      creep.harvest(source);
    }
    else{
      var container = Game.getObjectById(creep.memory.containerId);
      if (creep.pos.isEqualTo(container.pos)) {
        creep.harvest(source);
        creep.memory.landed = true;
      }
      else {
        creep.moveTo(container);
      }
    }
  }, // end run function
  burry : function(name) {
    // mark resource as free to mine
    Game.rooms[Memory.creeps[name].home].memory.containers[Memory.creeps[name].containerId].isFree = true;
    //clean memory left over
    delete Memory.creeps[name];
  }
};
