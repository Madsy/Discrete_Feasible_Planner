"use strict";

/*
  (Discrete Feasible Planning)
*/

module.exports = {
  flags: {
    /* comparison functions */
    ACTION_FN_CMP_EQUAL: 0,
    ACTION_FN_CMP_LEQUAL: 1,
    ACTION_FN_CMP_GEQUAL: 2,
    ACTION_FN_CMP_LESS: 3,
    ACTION_FN_CMP_GREATER: 4,
    ACTION_FN_CMP_TRUE: 5,
    ACTION_FN_CMP_FALSE: 6,
    /* transform functions / effects to apply */
    ACTION_FN_MOV: 0,
    ACTION_FN_ADD: 1,
    ACTION_FN_MUL: 2,
    /* operand type for comparison and transform functions */
    ACTION_OP_CONSTANT: 0,
    ACTION_OP_VAR: 1
  },

  cmpFuncToString: function(cmp){
    switch(cmp){
      case this.flags.ACTION_FN_CMP_EQUAL:
        return "equal";
      case this.flags.ACTION_FN_CMP_LEQUAL:
        return "less or equal";
      case this.flags.ACTION_FN_CMP_GEQUAL:
        return "greater or equal";
      case this.flags.ACTION_FN_CMP_LESS:
        return "less";
      case this.flags.ACTION_FN_CMP_GREATER:
        return "greater";
      case this.flags.ACTION_FN_CMP_TRUE:
        return "true";
      case this.flags.ACTION_FN_CMP_FALSE:
        return "false";
      }
  },

  transformFuncToString(tr){
    switch(tr){
      case this.flags.ACTION_FN_MOV:
      return "=";
      case this.flags.ACTION_FN_ADD:
      return "+=";
      case this.flags.ACTION_FN_MUL:
      return "*=";
    }
  },

  /* create a new empty action */
  createAction: function (id, name){
    let self = this;
    return {
      id: id,
      name: name,
      preconditions: [],
      effects: [],
      canApplyTo: function(state){
        return this.preconditions.every(function(p){
          let value = 0;
          if(p.fnOp === self.flags.ACTION_OP_CONSTANT){
            value = p.op2;
          } else if(p.fnOp === self.flags.ACTION_OP_VAR){
            value = state[p.op2];
          }
          let cmpResult = false;
          switch(p.fnType){
            case self.flags.ACTION_FN_CMP_EQUAL:
            cmpResult = (state[p.op1] === value);
            break;
            case self.flags.ACTION_FN_CMP_LEQUAL:
            cmpResult = (state[p.op1] <= value);
            break;
            case self.flags.ACTION_FN_CMP_GEQUAL:
            cmpResult = (state[p.op1] >= value);
            break;
            case self.flags.ACTION_FN_CMP_LESS:
            cmpResult = (state[p.op1] < value);
            break;
            case self.flags.ACTION_FN_CMP_GREATER:
            cmpResult = (state[p.op1] > value);
            break;
            case self.flags.ACTION_FN_CMP_TRUE:
            cmpResult = (state[p.op1] === true);
            break;
            case self.flags.ACTION_FN_CMP_FALSE:
            cmpResult = (state[p.op1] === false);
            break;
          }
          return cmpResult;
        });
      },
      applyTo: function(state){
        let state_prime = state.clone();
        for(let i = 0; i < this.effects.length; i++){
          let e = this.effects[i];
          let value = 0;
          if(e.fnOp === self.flags.ACTION_OP_CONSTANT){
            value = e.op2;
          } else if(e.fnOp === self.flags.ACTION_OP_VAR){
            value = state[e.op2];
          }
          switch(e.fnType){
            case self.flags.ACTION_FN_MOV:
            state_prime[e.op1] = value;
            break;
            case self.flags.ACTION_FN_ADD:
            state_prime[e.op1] += value;
            break;
            case self.flags.ACTION_FN_MUL:
            state_prime[e.op1] *= value;
            break;
          }
        }
        return state_prime;
      },
      printDescription: function(){
        console.log("===========================================");
        console.log(this.name.toUpperCase());
        if(this.preconditions[0].fnType === self.flags.ACTION_FN_CMP_TRUE || this.preconditions[0].fnType === self.flags.ACTION_FN_CMP_FALSE){
          console.log("if", this.preconditions[0].op1, "is", self.cmpFuncToString(this.preconditions[0].fnType));
        } else {
          console.log("if", this.preconditions[0].op1, self.cmpFuncToString(this.preconditions[0].fnType), this.preconditions[0].op2);
        }
        for(let i = 1; i < this.preconditions.length; i++){
          let p = this.preconditions[i];
          if(p.fnType === self.flags.ACTION_FN_CMP_TRUE || p.fnType === self.flags.ACTION_FN_CMP_FALSE){
            console.log("  and", p.op1, "is", self.cmpFuncToString(p.fnType));
          } else {
            console.log("  and if", p.op1, self.cmpFuncToString(p.fnType), p.op2);
          }
        }
        console.log("then:");
        for(let i = 0; i < this.effects.length; i++){
            let e = this.effects[i];
            console.log((i+1)+".)", e.op1, self.transformFuncToString(e.fnType), e.op2);
        }
      }
    }
  },

  actionAddPreconditionConstant: function(action, targetState, cmp, value){
    let self = this;
    action.preconditions.push({
      op1: targetState,
      op2: value,
      fnType: cmp,
      fnOp: self.flags.ACTION_OP_CONSTANT
    });
  },

  actionAddPreconditionVariable: function(action, targetState, cmp, value){
    let self = this;
    action.preconditions.push({
      op1: targetState,
      op2: value,
      fnType: cmp,
      fnOp: self.flags.ACTION_OP_VAR
    });
  },

  actionAddEffectConstant: function(action, targetState, cmp, value){
    let self = this;
    action.effects.push({
      op1: targetState,
      op2: value,
      fnType: cmp,
      fnOp: self.flags.ACTION_OP_CONSTANT
    });
  },

  actionAddEffectVariable: function(action, targetState, cmp, value){
    let self = this;
    action.effects.push({
      op1: targetState,
      op2: value,
      fnType: cmp,
      fnOp: self.flags.ACTION_OP_VAR
    });
  },

  createPlan: function(initial, goalReachedFn, actions, config){
    let self = this;
    let SUCCESS = 0;
    let FAILURE = 1;
    let FAILURE_FOUND_CYCLE = 2;
    let queue = [initial];
    let visited_nodes_set = new Set();

    initial.children = [];
    initial.parent = null;
    initial.action = -1;
    initial.parent_id = -1;
    initial.treedepth = -1; //let the first states represent depth "0"

    let totalNodeCount = 1;
    let treeDepth = -1;

    let maxTreeSize = (config.maxTreeSize ? config.maxTreeSize : 10e7);
    let maxTreeDepth = (config.maxTreeDepth ? config.maxTreeDepth : 32);

    let nodes_skipped_because_cycle = 0; //statistics of hash set optimization

    if(!initial.clone){
      throw Error("initial state must have a clone operator / be cloneable");
    }
    if(!goalReachedFn){
      throw Error("missing goal comparison function");
    }
    if(!actions || !actions.length){
      throw Error("action array is undefined or empty");
    }

    let generateSolutionGraphPath = function(state){
      while(state.parent){
        delete state.children;
        delete state.parent_id;
        //delete state.action;
        //delete state.parent;
        delete state.children;
        delete state.treedepth;
        state.parent.next = state;
        state = state.parent;
      }
      delete state.children;
      delete state.parent_id;
      //delete state.action;
      delete state.parent;
      delete state.children;
      delete state.treedepth;

      return state;
    }

    while(queue.length > 0 && (totalNodeCount < maxTreeSize) && (treeDepth < maxTreeDepth)){
      let state = queue[0];
      queue.splice(0,1);
      let numStatesAdded = 0;
      for(let i = 0; i < actions.length; i++){
        let action = actions[i];
        if(action.canApplyTo(state)){
          let state_prime = action.applyTo(state);
          if(visited_nodes_set.has(state_prime.toString())){
            nodes_skipped_because_cycle++;
            continue;
          }
          visited_nodes_set.add(state_prime.toString());
          state_prime.parent_id = state.children.length;
          state_prime.action = action.id;
          state_prime.parent = state;
          state_prime.children = [];
          state_prime.treedepth = state.treedepth + 1;
          state.children.push(state_prime);
          if(state_prime.treedepth > treeDepth){
            treeDepth = state_prime.treedepth;
          }
          queue.push(state_prime);
          numStatesAdded++;
          totalNodeCount++;
          if(goalReachedFn(state_prime)){
            //TODO reverse order of the graph here
            return {
              status: SUCCESS,
              statistics: {
                num_nodes_skipped: nodes_skipped_because_cycle,
                num_nodes_visited: totalNodeCount
              },
              plan: generateSolutionGraphPath(state_prime)
            };
          }
        }
      }

      if(!numStatesAdded && state.parent !== null){
        //'state' is a leaf which leads nowhere.
        //backtrack in tree free up memory. find long thin branches and clean up as long as we find leafs
        while(state.parent.parent !== null && state.parent.parent.children.length === 1){
          state = state.parent;
        }
        state.parent.children.splice(state.parent_id, 1);
        state.parent = null;
      }

    }
    if(queue.length === 0){
      console.log("createPlanGeneric(): exhausted all options (tried all permutations)");
    }
    if(totalNodeCount >= maxTreeSize){
      console.log("createPlanGeneric(): max number of nodes reached");
    }
    if(treeDepth >= maxTreeDepth){
      console.log("createPlanGeneric(): max tree depth reached");
    }
    return {status: FAILURE, plan: null};
  }
};
