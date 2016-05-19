const eachBlockPre = (t, action, args) => {
  action(t, args);
  t.functions.forEach( (fun) => eachBlockPre (fun, action, args));
};

/*
  A cada nodo del arbol que recorramos, crearemos una symbolTable para su ámbito
*/

function semantic (tree) {
  eachBlockPre(tree, (t, args) => {
    t.symbolTable = {
      CONSTANTS : t.constants,
      VARIABLES : t.variables,
      FUNCTIONS : t.functions
    };
  }, null);
}

module.exports = semantic;
