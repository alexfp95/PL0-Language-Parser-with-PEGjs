const eachBlockPre = (t, action, args) => {
  action(t, args);
  t.functions.forEach( (fun) => eachBlockPre (fun, action, args));
};

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
