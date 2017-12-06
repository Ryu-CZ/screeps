// operates my defence

module.exports = {
  run : function() {
    var towers = _.filter(
      Game.structures,
      s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
      var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
      filter: c=> c.getActiveBodyparts(HEAL) > 0 && c.getActiveBodyparts(HEAL) > 14});
      if (target == undefined) {
            target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: c=> c.getActiveBodyparts(HEAL) > 0});
            if (target == undefined) {
              target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            }
            else {
                tower.room.memory.hostileCreeps = true;
            }
      }
      else {
          tower.room.memory.hostileCreeps = true;
          return;
      }
      // no enemy
      if (target == undefined) {
        tower.room.memory.hostileCreeps = false;
        // heal someone
        if (tower.energyCapacit*0.62 > tower.energy){}
          target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: c => c.hits < c.hitsMax && c.ticksToLive > 420
          });
          if (target != undefined) {
            tower.heal(target);
        }
      }
      // attack target
      else{
        tower.room.memory.hostileCreeps = true;
        tower.attack(target);
      }
    } // for end
  } // run end
}; // end export
