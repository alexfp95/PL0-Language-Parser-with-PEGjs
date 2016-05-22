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

  eachBlockPre(tree, (t, args) => {
    t.main.children.forEach( (f) => {
      recorrerHashes(f, tree);
    });
  }, null);
}

/*
  Busca si en las symbolTable de los padres del nodo esa constante ha sido declarada
*/

function buscarSymbol (nodo, cte) {
  if(nodo != null)
    buscarSymbolEnSi (nodo, cte);
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
      $('#error').html('<div><pre>\n' + " > > > > > > Error: Constante " + cte[0] + " redeclarada. Bloque: " + nodo.symbolTable.NAME + " < < < < < < " + '\n</pre></div>');
        console.log(" > > > > > > Error: Constante " + cte[0] + " redeclarada. Bloque: " + nodo.symbolTable.NAME + " < < < < < < ");
        buscar = false;
      } else {
        symbolTable = symbolTable.FATHER_SYMBOLTABLE;
      }
    }
  }
}

/*
  Busca si contiene la cte ya definida en ese mismo Bloque
*/

function buscarSymbolEnSi (nodo, cte) {
  contador = 0;
  nodo.symbolTable.CONSTANTS.forEach ( (c) => {
    if(c.indexOf (cte[0]) != -1) { contador++; };
  });
  if (contador > 1) {
      $('#error').html('<div><pre>\n' + " > > > > > > Error: Constante " + cte[0] + " redeclarada. Bloque: " + nodo.symbolTable.NAME + " < < < < < < " + '\n</pre></div>');

    console.log(" > > > > > > Error: Constante " + cte[0] + " redeclarada. Bloque: " + nodo.symbolTable.NAME + " < < < < < < ");
  }
}

/*
  Recorre hashes para encontrar llamadas 'CALL'
*/

function recorrerHashes (h, tree) {
  for(var i in h) {
    if(h.hasOwnProperty(i)) {
      if(i == 'type') {
        if(h[i] == 'CALL') {
          comprobarArgumentosFuncion(h.func.value, h.arguments.length, tree);
        }
      }
      else if (h[i].type != undefined) {
        recorrerHashes (h[i].children, tree);
        recorrerHashes (h[i], tree);
      }
    }
  }
}

/*
  Comprueba si el numero de argumentos que recibe una funcion es correcto
*/

function comprobarArgumentosFuncion (f, numArgs, tree) {
  eachBlockPre(tree, (t, args) => {
    if (t.symbolTable.NAME == f) {
      if(t.symbolTable.PARAMS.length != numArgs) {
        console.log("> Error: En la funcion " + f + " se esperaban " + t.symbolTable.PARAMS.length + " argumentos, y se recibieron " + numArgs);
      }
    }
  }, null);
}


module.exports = semantic;
