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
      NAME : t.name.value,
      CONSTANTS : t.constants,
      VARIABLES : t.variables,
      FUNCTIONS : t.functions
    };
  }, null);

  eachBlockPre(tree, (t, args) => {
    t.functions.forEach( (fun) => {
      fun.symbolTable.FATHER = t.name.value,
      fun.symbolTable.FATHER_SYMBOLTABLE = t.symbolTable
    });
  }, null);
}

module.exports = semantic;
