// worker collecting energy resources and conbstruct new structures from it
var roleUtils = require('role.utils')
var roleUpgrader = require('role.upgrader')

module.exports = {
  run : function(creep, check) {
    if (check) {
      roleUtils.checkLoad(creep)
    }
    // behavior
    if (creep.memory.working) {
      var wall = undefined
      var walls = undefined
      if (creep.memory.toRepair == undefined) {
        walls = creep.room.find(
          FIND_STRUCTURES,
          {
            filter: (s) => (s.structureType == STRUCTURE_WALL ||
              s.structureType == STRUCTURE_RAMPART) &&
              s.hits < s.hitsMax
          });
        wall = _.min(walls, (w) => w.hits)
        wall = creep.pos.findClosestByRange(
          FIND_STRUCTURES,
          {
            filter: (s) => (s.structureType == STRUCTURE_WALL ||
              s.structureType == STRUCTURE_RAMPART) &&
              s.hits <= wall.hits
          });
      }
      else {
        wall = Game.getObjectById(creep.memory.toRepair)
        if (wall == undefined) {
          creep.memory.toRepair = undefined;
        }
        else {
          if (wall.hits >= wall.hitsMax) {
            walls = creep.pos.find(
              FIND_STRUCTURES,
              {
                filter: (s) => (s.structureType == STRUCTURE_WALL ||
                  s.structureType == STRUCTURE_RAMPART) &&
                  s.hits < s.hitsMax
              });
            if (walls == undefined) {
              wall = undefined
              creep.memory.toRepair = undefined
            }
            else {
              wall = _.min(walls, (w) => w.hits)
              wall = creep.pos.findClosestByRange(
                FIND_STRUCTURES,
                {
                  filter: (s) => (s.structureType == STRUCTURE_WALL ||
                    s.structureType == STRUCTURE_RAMPART) &&
                    s.hits <= wall.hits
                });
            }
          }
        }
      }
      if (wall == undefined) {
        // switch to upgrader if there is nothing to build
        roleUpgrader.run(creep, creep.room.controller, false);
      }
      else {
        // remember structure
        creep.memory.toRepair = wall.id
        // repair structure
        if (creep.repair(wall) == ERR_NOT_IN_RANGE) {
          creep.moveTo(wall);
        }
      }
    }
    else {
      // reset target
      creep.memory.toRepair = undefined
      // gather resources
      var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
        // reset wall to repair when empty
      }
    }
  }, // end run function
  // clean remains of creep
  burry : function(name, spawn) {
    //clean memory left over
    delete Memory.creeps[name];
  }
}
