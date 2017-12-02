// operates my defence

module.exports = {
  run : function() {
    var towers = _.filter(
      Game.structures,
      s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
      var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      // no enemy
      if (target == undefined) {
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
        tower.attack(target);
      }
    } // for end
  } // run end
}; // end export
