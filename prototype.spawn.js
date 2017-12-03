var roleMiner = require('role.miner')
var roleProspector = require('role.prospector')

var homeRoles = ['harvester', 'carry', 'claimer', 'repairer', 'upgrader', 'builder', 'waller'];
var defaultMinCreeps = {
  'builder':2,
  'carry':3,
  'harvester':0,
  'repairer':1,
  'upgrader':2,
  'waller':1
};


module.exports = function() {

  StructureSpawn.prototype.install = function() {
    if (this.memory.counters == undefined) {
      this.memory.counters = {};
      for (let role of homeRoles) {
        this.memory.counters['miner'] = 0;
        if (this.memory.counters[role] == undefined)
          this.memory.counters[role] = 0;
      }
    }
    if (this.memory.minCreeps == undefined) {
      this.memory.minCreeps = Object.assign({}, defaultMinCreeps);
    }
    if (this.memory.colonies == undefined) {
      this.memory.colonies = {};
      }
    if (this.memory.maxBuilders == undefined) {
      this.memory.maxBuilders = 3;
    }
    if (this.memory.carryEnergy == undefined) {
      this.memory.carryEnergy = 300;
    }
    if (this.room.memory.sources == undefined) {
      // make tokens for each resource of room suitable for mining
      this.room.memory.sources = [];
      this.room.memory.containers = {};
      let sources = this.room.find(FIND_SOURCES)
      for (let i in sources) {
        this.room.memory.sources.push(sources[i].id);
        let containers = sources[i].pos.findInRange(
          FIND_STRUCTURES,
          1,
          {filter: (s) => s.structureType == STRUCTURE_CONTAINER}
          )
        for (let c in containers) {
          if (this.room.memory.containers[containers[c].id] == undefined) {
            (this.room.memory.containers[containers[c].id]) = {
              isFree: true,
              sourceId: sources[i].id
            }
          } // if containers[containers[c].id] == undefined
        } // for containers
      } //for sources
    } // if (this.room.memory.sources == undefined)
    this.memory.installed = true;
  }; // end install

  StructureSpawn.prototype.breed = function() {
    if (!(this.memory.installed)) {
      // setup new spawn
      console.log('Initializing core: ' + this.name)
      this.install();
    }
    // count my creeps
    let roomCreeps = this.room.find(FIND_MY_CREEPS);
    for (let role of homeRoles) {
      this.memory.counters[role] = _.sum(roomCreeps, (c) => c.memory.role == role);
    }
    this.memory.counters['miner'] = _.sum(roomCreeps, (c) => c.memory.role == 'miner');
    var energyCapacity = this.room.energyCapacityAvailable;
    var name = undefined;
    // primal check if there is emergency in production line
    // emergency plan for rooms with storage
    if ((this.room.storage == undefined) && ( this.memory.counters['harvester'] == 0 && (this.memory.counters['miner'] == 0 || this.memory.counters['carry'] == 0))) {
        if (this.memory.counters['miner'] > 0) {
          name = this.createCarry(this.room.energyAvailable)
        }
        else {
          name = this.createCustomCreep(
              this.room.energyAvailable,
              'harvester');
        }
    }
    // emergency plan for rooms without storage
    else if (0 == (this.memory.counters['harvester'] + this.memory.counters['carry'])) {
      if ( this.memory.counters['miner'] > 0 || this.room.storage[RESOURCE_ENERGY] >= 700) {
        name = this.createCarry(150);
      }
      else { // this.memory.counters['harvester'] + this.memory.counters['carry'] + this.memory.counters['miner'] = 0
        // create harvester because it can work on its own
        name = this.createCustomCreep(
            this.room.energyAvailable,
            'harvester');
      }
    } // finished emergency check
    else {
      // first try create miner for free mining post
      for (let c in this.room.memory.containers) {
        if (this.room.memory.containers[c].isFree) {
          name = this.createMiner(c, this.room.memory.containers[c].sourceId);
          if (!(name < 0)) {
            break;
          }
        }
      }
      // common creeps
      if (name == undefined) {
        // try create creeps for home maintainence
        for (let role of homeRoles) {
          // check for claim order
          if (role == 'claimer' && this.memory.claimRoom != undefined) {
            // try to spawn a claimer
            name = this.createClaimer(this.memory.claimRoom);
            // if that worked
            if (name != undefined && _.isString(name)) {
              // delete the claim order
              delete this.memory.claimRoom;
              break;
            }
          }
          // if no claim order was found, check other roles
          else if (this.memory.counters[role] < this.memory.minCreeps[role]) {
            if (role == 'carry') {
              name = this.createCarry(this.memory.carryEnergy);
            }
            else {
              name = this.createCustomCreep(energyCapacity, role);
            }
            break;
          }
        }

        if (name == undefined)  {
          // try colonize other rooms as planed
          for (var room in this.memory.colonies) {
            for (var source in this.memory.colonies[room]){
              if (this.memory.colonies[room][source].prospectors < this.memory.colonies[room][source].minProspectors) {
                name = this.createProspector(
                  energyCapacity,
                  this.memory.colonies[room][source].workParts,
                  this.room.name,
                  room,
                  source);
                if (!(name < 0)) {
                  this.memory.colonies[room][source].prospectors += 1;
                  break;
                }
              } // if prospectors < minProspectors
            } // loop souces
          } // loop colonies
        } // end colonization try
        // default option to spawn
        if (name == undefined && this.memory.counters['builder'] < this.memory.maxBuilders) {
          // try default creep : builder
          name = this.createCustomCreep(energyCapacity, 'builder');
        } // default option to spawn
      } // common creeps
    } // spawning
    // clear dead creeps
    for (let c in Memory.creeps) {
      if (Game.creeps[c] == undefined) {
        console.log(this.name + " - Desolving creep: " + c + "(" + Memory.creeps[c].role + ")");
        if (Memory.creeps[c].role == 'miner') {
          roleMiner.burry(c, this);
        }
        else if (Memory.creeps[c].role == 'prospector') {
          roleProspector.burry(c);
        }
        delete Memory.creeps[c];
        console.log("miner: " + this.memory.counters['miner']);
        for (let role of homeRoles) {
          console.log(role  + ": " + this.memory.counters[role]);
        }
      }
    }
    if ( name != undefined && _.isString(name) ) {
      console.log(this.name + " - Spawned new creep: " + name + "(" + Game.creeps[name].memory.role + ")");
      console.log("miner: " + this.memory.counters['miner']);
      for (let role of homeRoles) {
        console.log(role  + ": " + this.memory.counters[role]);
      }
    }
  };

  StructureSpawn.prototype.updateContainers = function() {
    if (this.room.memory.sources == undefined) {
      this.room.memory.sources = [];
    }
    if (this.room.memory.containers == undefined) {
      this.room.memory.containers = {};
    }
    let sources = this.room.find(FIND_SOURCES)
    for (let i in sources) {
      this.room.memory.sources.push(sources[i].id);
      let containers = sources[i].pos.findInRange(
        FIND_STRUCTURES,
        1,
        {filter: (s) => s.structureType == STRUCTURE_CONTAINER}
        )
      for (let c in containers) {
        if (this.room.memory.containers[containers[c].id] == undefined) {
          (this.room.memory.containers[containers[c].id]) = {
            isFree: true,
            sourceId: sources[i].id
          }
        }
      } // for containers
    } //for sources
  }; //end updateContainers

  // create a new function for StructureSpawn
  StructureSpawn.prototype.createCustomCreep = function(
        energy,
        roleName)
      {
      // create a balanced body as big as possible with the given energy
      var partsCnt = Math.floor(energy / 200);
      var body = [];
      for (let i = 0; i < partsCnt; i++) {
          body.push(WORK);
      }
      for (let i = 0; i < partsCnt; i++) {
          body.push(CARRY);
      }
      for (let i = 0; i < partsCnt; i++) {
          body.push(MOVE);
      }

      // build creep memory based on role
      var mem = {
        role: roleName,
        working: false,
        home: this.room.name
      }
      if (roleName == 'repairer') {
        mem.toRepair = undefined
      }
      else if (roleName == 'waller') {
        mem.toRepair = undefined
      }
      // create creep with the created body and the given role
      return this.createCreep(body, undefined, mem);
    }; // end createCustomCreep

  // create a long distance harvester
  StructureSpawn.prototype.createTraveler = function(
      energy,
      role,
      workPartsCnt,
      home,
      target,
      sourceIdx
    )
    {
      var body = [];
      for (let i = 0; i < workPartsCnt; i++) {
        body.push(WORK)
      }
      energy -= 100 * workPartsCnt
      var partsCnt = Math.floor(energy / 100) // (carry + move) = 100 energy
      for (let i = 0; i < partsCnt; i++) {
          body.push(CARRY);
      }
      for (let i = 0; i < partsCnt; i++) {
          body.push(MOVE);
      }
      // build creep memory based on role
      var mem = {
        role: role,
        working: false,
        home: home,
        target: target,
        sourceIdx: sourceIdx
      }
      // create creep with the created body and the given role
      return this.createCreep(body, undefined, mem);
    }; // end function


  // create a other room claimer
  StructureSpawn.prototype.createClaimer = function(
      target
    )
    {
      return this.createCreep(
        [CLAIM, MOVE],
        undefined,
        {
          role: 'claimer',
          target: target,
          home: this.room.name
        });
    }; // end claimer

  // create static miner
  StructureSpawn.prototype.createMiner = function(
      containerId,
      sourceId
    )
    {
      var body = [WORK, WORK, WORK, WORK, WORK, MOVE];
      if ( 600 <= this.room.energyAvailable ) {
        body.push(MOVE);
      }
      name = this.createCreep(
        body,
        undefined,
        {
          role: 'miner',
          containerId: containerId,
          sourceId: sourceId,
          home: this.room.name
        });
      if (!(name < 0)) {
        this.room.memory.containers[containerId].isFree = false;
      }
      return name;
    }; // end miner

  // create a carrier
  StructureSpawn.prototype.createCarry = function(
      energy
    )
    {
    // create a carry body as big as possible with the given energy
    var partsCnt = Math.floor(energy / 150);
    var body = [];
    for (let i = 0; i < partsCnt * 2; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < partsCnt; i++) {
        body.push(MOVE);
    };
    // build creep memory based on role
    var mem = {
      role: 'carry',
      working: false,
      home:this.room.name
    }
    // create creep with the created body and the given role
    return this.createCreep(body, undefined, mem);
  }; // end createCarry()

  // create a long distance miner
  StructureSpawn.prototype.createProspector = function(
      energy,
      workPartsCnt,
      home,
      target,
      sourceIdx
    )
    {
      var body = [];
      for (let i = 0; i < workPartsCnt; i++) {
        body.push(WORK)
      }
      energy -= 100 * workPartsCnt
      var partsCnt = Math.floor(energy / 100) // (carry + move) = 100 energy
      for (let i = 0; i < partsCnt; i++) {
          body.push(CARRY);
      }
      for (let i = 0; i < partsCnt; i++) {
          body.push(MOVE);
      }
      // build creep memory based on role
      var mem = {
        role: 'prospector',
        working: false,
        home: home,
        target: target,
        sourceIdx: sourceIdx,
        spawn: this.name,
        toRepair:undefined
      }
      // create creep with the designed body and the given role
      var name = this.createCreep(body, undefined, mem);
      return name
    }; // end createProspector(..)

  // setup colony design
  StructureSpawn.prototype.colonize = function(
      room,
      sourceIdx=0,
      minProspectors=1,
      workParts=4
    )
    {
      if (this.memory.colonies == undefined) {
        this.memory.colonies = {};
      }
      if ( this.memory.colonies[room] == undefined) {
        this.memory.colonies[room] = {};
      }
      this.memory.colonies[room][sourceIdx] = {
        minProspectors: minProspectors,
        prospectors: 0,
        workParts: workParts};
      return "colony design - ok";
    }; // end colonize(..)

  // Marks room to claim
  /** @param {string} roomName - identifier of room to claim */
  StructureSpawn.prototype.claim = function(
      roomName
  )
  {
    this.memory.claimRoom = roomName;
    return "room " + roomName +" marked to be claimed  - ok";
  }
};
