const planner = require('../src/planner.js');

var ACTION_ID_MOVE_LEFT = 0;
var ACTION_ID_MOVE_RIGHT = 1;
var ACTION_ID_PUSH_BOX_LEFT = 2;
var ACTION_ID_PUSH_BOX_RIGHT = 3;
var ACTION_ID_STEP_ONTO_BOX = 4;
var ACTION_ID_STEP_OFF_BOX = 5;
var ACTION_ID_GRAB_BANANAS = 6;
var ACTION_ID_EAT_BANANAS = 7;

function createInitialState(){
  let clone = function(){
    return {
      clone: this.clone,
      toString: this.toString,
      pos_x: this.pos_x,
      pos_y: this.pos_y,
      box_x: this.box_x,
      box_y: this.box_y,
      bananas_pos_x: this.bananas_pos_x,
      bananas_pos_y: this.bananas_pos_y,
      have_bananas: this.have_bananas,
      bananas_eaten: this.bananas_eaten
    }
  };
  let toString = function(){
    return "px"+this.pos_x+"py"+this.pos_y+
          "bx"+this.box_x+"by"+this.box_y+
          "bpx"+this.bananas_pos_x+"bpy"+this.bananas_pos_y+
          "hb"+this.have_bananas+"be"+this.bananas_eaten;
  };

  return {
    clone: clone,
    toString: toString,
    pos_x: 0,
    pos_y: 0,
    box_x: 8,
    box_y: 0,
    bananas_pos_x: 3,
    bananas_pos_y: 1,
    have_bananas: false,
    bananas_eaten: false
  };
}

function goalHaveEatenBananas(state){
  return (state.bananas_eaten ? true : false);
}


function createActions(){
  let actions = [];

  actions.push(planner.createAction(0, "move_left"));
  actions.push(planner.createAction(1, "move_right"));
  actions.push(planner.createAction(2, "push_box_left"));
  actions.push(planner.createAction(3, "push_box_right"));
  actions.push(planner.createAction(4, "step_onto_box"));
  actions.push(planner.createAction(5, "step_off_box"));
  actions.push(planner.createAction(6, "grab_bananas"));
  actions.push(planner.createAction(7, "eat_bananas"));

  planner.actionAddPreconditionConstant(actions[ACTION_ID_MOVE_LEFT], "pos_x", planner.flags.ACTION_FN_CMP_GREATER, 0); //not out of bounds
  planner.actionAddPreconditionConstant(actions[ACTION_ID_MOVE_LEFT], "pos_y", planner.flags.ACTION_FN_CMP_EQUAL, 0); //on ground
  planner.actionAddEffectConstant(actions[ACTION_ID_MOVE_LEFT], "pos_x", planner.flags.ACTION_FN_ADD, -1);

  planner.actionAddPreconditionConstant(actions[ACTION_ID_MOVE_RIGHT], "pos_x", planner.flags.ACTION_FN_CMP_LESS, 10); //not out of bounds
  planner.actionAddPreconditionConstant(actions[ACTION_ID_MOVE_RIGHT], "pos_y", planner.flags.ACTION_FN_CMP_EQUAL, 0); //on ground
  planner.actionAddEffectConstant(actions[ACTION_ID_MOVE_RIGHT], "pos_x", planner.flags.ACTION_FN_ADD, 1);

  planner.actionAddPreconditionConstant(actions[ACTION_ID_PUSH_BOX_LEFT], "pos_x", planner.flags.ACTION_FN_CMP_GREATER, 0); //not out of bounds
  planner.actionAddPreconditionVariable(actions[ACTION_ID_PUSH_BOX_LEFT], "pos_x", planner.flags.ACTION_FN_CMP_EQUAL, "box_x"); //close to box
  planner.actionAddPreconditionConstant(actions[ACTION_ID_PUSH_BOX_LEFT], "pos_y", planner.flags.ACTION_FN_CMP_EQUAL, 0); //on ground
  planner.actionAddEffectConstant(actions[ACTION_ID_PUSH_BOX_LEFT], "pos_x", planner.flags.ACTION_FN_ADD, -1);
  planner.actionAddEffectConstant(actions[ACTION_ID_PUSH_BOX_LEFT], "box_x", planner.flags.ACTION_FN_ADD, -1);

  planner.actionAddPreconditionConstant(actions[ACTION_ID_PUSH_BOX_RIGHT], "pos_x", planner.flags.ACTION_FN_CMP_LESS, 10); //not out of bounds
  planner.actionAddPreconditionVariable(actions[ACTION_ID_PUSH_BOX_RIGHT], "pos_x", planner.flags.ACTION_FN_CMP_EQUAL, "box_x"); //close to box
  planner.actionAddPreconditionConstant(actions[ACTION_ID_PUSH_BOX_RIGHT], "pos_y", planner.flags.ACTION_FN_CMP_EQUAL, 0); //on ground
  planner.actionAddEffectConstant(actions[ACTION_ID_PUSH_BOX_RIGHT], "pos_x", planner.flags.ACTION_FN_ADD, 1);
  planner.actionAddEffectConstant(actions[ACTION_ID_PUSH_BOX_RIGHT], "box_x", planner.flags.ACTION_FN_ADD, 1);

  planner.actionAddPreconditionVariable(actions[ACTION_ID_STEP_ONTO_BOX], "pos_x", planner.flags.ACTION_FN_CMP_EQUAL, "box_x"); //close to box
  planner.actionAddPreconditionConstant(actions[ACTION_ID_STEP_ONTO_BOX], "pos_y", planner.flags.ACTION_FN_CMP_EQUAL, 0); //on ground
  planner.actionAddEffectConstant(actions[ACTION_ID_STEP_ONTO_BOX], "pos_y", planner.flags.ACTION_FN_MOV, 1);

  planner.actionAddPreconditionVariable(actions[ACTION_ID_STEP_OFF_BOX], "pos_x", planner.flags.ACTION_FN_CMP_EQUAL, "box_x"); //close to box
  planner.actionAddPreconditionConstant(actions[ACTION_ID_STEP_OFF_BOX], "pos_y", planner.flags.ACTION_FN_CMP_EQUAL, 1); //on top of box
  planner.actionAddEffectConstant(actions[ACTION_ID_STEP_OFF_BOX], "pos_y", planner.flags.ACTION_FN_MOV, 0);

  planner.actionAddPreconditionVariable(actions[ACTION_ID_GRAB_BANANAS], "pos_x", planner.flags.ACTION_FN_CMP_EQUAL, "bananas_pos_x"); //can reach bananas
  planner.actionAddPreconditionVariable(actions[ACTION_ID_GRAB_BANANAS], "pos_y", planner.flags.ACTION_FN_CMP_EQUAL, "bananas_pos_y"); //can reach bananas
  planner.actionAddPreconditionConstant(actions[ACTION_ID_GRAB_BANANAS], "have_bananas", planner.flags.ACTION_FN_CMP_FALSE); //don't have bananas already
  planner.actionAddEffectConstant(actions[ACTION_ID_GRAB_BANANAS], "have_bananas", planner.flags.ACTION_FN_MOV, true);

  planner.actionAddPreconditionConstant(actions[ACTION_ID_EAT_BANANAS], "have_bananas", planner.flags.ACTION_FN_CMP_TRUE); //need bananas to eat
  planner.actionAddEffectConstant(actions[ACTION_ID_EAT_BANANAS], "bananas_eaten", planner.flags.ACTION_FN_MOV, true);
  planner.actionAddEffectConstant(actions[ACTION_ID_EAT_BANANAS], "have_bananas", planner.flags.ACTION_FN_MOV, false);

  return actions;
}

/* build building in room "roomName" */
function createMonkeyPlan(initial, goal, actions, config){
  return planner.createPlan(initial, goal, actions, config);
}


function printPlan(node, actions){
  console.log("initial state:");
  console.log("pos_x:",node.pos_x);
  console.log("pos_y:",node.pos_y);
  console.log("box_x:",node.box_x);
  console.log("box_y:",node.box_y);
  console.log("bananas_pos_x:",node.bananas_pos_x);
  console.log("bananas_pos_y:",node.bananas_pos_y);
  console.log("have_bananas:",node.have_bananas);
  console.log("bananas_eaten:",node.bananas_eaten);
  console.log("==================================================");

  let stepNum = 1;
  while(node.next){
    /*
    console.log("performing action '", actions[node.next.action].name, "''");
    console.log("new state:");
    console.log("pos_x:",node.next.pos_x);
    console.log("pos_y:",node.next.pos_y);
    console.log("box_x:",node.next.box_x);
    console.log("box_y:",node.next.box_y);
    console.log("bananas_pos_x:",node.next.bananas_pos_x);
    console.log("bananas_pos_y:",node.next.bananas_pos_y);
    console.log("have_bananas:",node.next.have_bananas);
    console.log("bananas_eaten:",node.next.bananas_eaten);
    */
    console.log("step", stepNum, ": '", actions[node.next.action].name, "'");
    stepNum++;
    node = node.next;
  }
}











let actions = createActions();
let initial = createInitialState();
let config = {maxTreeSize: (1<<20), maxTreeDepth: 16};
console.log("Action table:");
for(let i = 0; i < actions.length; i++){
  actions[i].printDescription();
}
console.log("\n\n\n");
let result = createMonkeyPlan(initial, goalHaveEatenBananas, actions, config);
if(result.status === 0){
  console.log("found plan with", config.maxTreeDepth, "steps");
  console.log("number of skipped nodes:", result.statistics.num_nodes_skipped);
  console.log("total of states visited:", result.statistics.num_nodes_visited);
  printPlan(result.plan, actions);
} else {
  console.log("no solution");
}
process.exit(0);
