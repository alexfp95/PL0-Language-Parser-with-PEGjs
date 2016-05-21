const eachBlockPre = (t, action, args) => {
  action(t, args);
  t.functions.forEach( (fun) => eachBlockPre (fun, action, args));
};

function semantic (tree) {

  /*
    A cada nodo del arbol que recorramos, crearemos una symbolTable para su ámbito
  */

  eachBlockPre(tree, (t, args) => {
    t.symbolTable = {
      NAME : t.name.value,
      CONSTANTS : t.constants,
      VARIABLES : t.variables,
      FUNCTIONS : t.functions,
      PARAMS : t.params
    };
  }, null);

  /*
    Añadimos a cada symbolTable, la symbolTable de su padre para el ámbito
  */

  eachBlockPre(tree, (t, args) => {
    t.functions.forEach( (fun) => {
      fun.symbolTable.FATHER = t.name.value,
      fun.symbolTable.FATHER_SYMBOLTABLE = t.symbolTable
    });
  }, null);

  /*
    Comprueba que no se hagan redeclaraciones de constantes
  */

  eachBlockPre(tree, (t, args) => {
    t.constants.forEach( (cte) => {
      buscarSymbol(t, cte)
    });
  }, null);
}

/*
  Busca si en las symbolTable de los padres del nodo esa constante ha sido declarada
*/

function buscarSymbol (nodo, cte) {
  symbolTable = nodo.symbolTable.FATHER_SYMBOLTABLE;
  buscar = true;
  while (buscar) {
    if (symbolTable == null) {
      buscar = false;
    } else {
      encontrado = false;
      symbolTable.CONSTANTS.forEach ( (c) => {
        if(c.indexOf (cte[0]) != -1) { encontrado = true; };
      });
      if (encontrado) {
        console.log(" > > > > > > Error: Constante " + cte[0] + " redeclarada. Bloque: " + nodo.symbolTable.NAME + " < < < < < < ");
        buscar = false;
      } else {
        symbolTable = symbolTable.FATHER_SYMBOLTABLE;
      }
    }
  }
}

module.exports = semantic;
