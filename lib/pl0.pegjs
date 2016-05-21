{
  var tree = function(f, r) {
    if (r.length > 0) {
      var last = r.pop();
      var result = {
        type:  last[0],
        left: tree(f, r),
        right: last[1]
      };
    }
    else {
      var result = f;
    }
    return result;
  }
}

program = b:block { b.name = {type: 'ID', value: "$main"}; b.params = []; return b;}

/*
  El bloque puede estar formado por declaracion de constantes, variables o funciones
*/

block = cD:constantDeclaration? vD:varDeclaration? fD:functionDeclaration* st:st
          {
            let constants = cD? cD : [];
            let variables = vD? vD : [];
            return {
              type: 'BLOCK',
              constants: constants,
              variables: variables,
              functions: fD,
              main: st
            };
          }

/*
  Declaracion de constantes
*/

constantDeclaration = CONST id:ID ASSIGN n:NUMBER rest:(COMMA ID ASSIGN NUMBER)* SC
                        // rest está formando por el conjunto de declaraciones en una misma linea
                        {
                          let r = rest.map( ([_, id, __, nu]) => [id.value, nu.value] );
                          return [[id.value, n.value]].concat(r)
                        }

/*
  Declaracion de variables
*/

varDeclaration = VAR id:ID rest:(COMMA ID)* SC
                    {
                      let r = rest.map( ([_, id]) => id.value );
                      return [id.value].concat(r)
                    }

/*
    Declaracion de funciones del tipo: function prueba (parametros)
*/

functionDeclaration = FUNCTION id:ID LEFTPAR !COMMA p1:ID? r:(COMMA ID)* RIGHTPAR SC b:block SC
                                                    // parametros opcionales
      {
        let params = p1? [p1] : [];
        params = params.concat(r.map(([_, p]) => p));
        return Object.assign({      // Permite asignarle información al bloque que contiene
          type: 'FUNCTION',
          name: id,
          params: params,
        }, b);

      }

/*
  Statements.
*/

st     = CL s1:st? r:(SC st)* SC* CR {
               let t = [];
               if (s1) t.push(s1);
               return {
                 type: 'COMPOUND', // Chrome supports destructuring
                 children: t.concat(r.map( ([_, st]) => st ))
               };
            }
       / IF e:assign THEN st:st ELSE sf:st
           {
             return {
               type: 'IFTHENELSE',
               c:  e,
               st: st,
               sf: sf,
             };
           }
       / IF e:assign THEN st:st
           {
             return {
               type: 'IFTHEN',
               c:  e,
               st: st
             };
           }
       / WHILE a:assign DO st:st {
             return { type: 'WHILE', c: a, st: st };
           }

        /*
          Bucle for:
            for 1 to 5 do {
              a = 5;
            }
        */

       / FOR n1:NUMBER TO n2:NUMBER DO st:st {
             return {
               type: 'FOR',
               ini: n1,
               fin: n2,
               indice: n1,
               st: st
             };
          }

        /*
          Switchs del tipo:
            switch c + d do {
              case a : r = 2; break;
              case 1 : r = 3; break;
            };
        */

       / SWITCH e:exp DO CL c:cas r:( _ cas)* CR {
              let cases = [c];
              cases = cases.concat(r.map( ([_, ca]) => ca));
              return {
                type: 'SWITCH',
                var: e,
                cases: cases
              };
       }

       /*
          Do while:
          do {statements} while (condition)
       */

       / DO st:st WHILE c:cond {
         return {
           type: 'DO-WHILE',
           st: st,
           condition: c
         };
       }

       / RETURN a:assign? {
             return { type: 'RETURN', children: a? [a] : [] };
           }
       / assign

/*
  case de los switch
*/

cas = CASE f:factor DP st:st SC BREAK SC {
    return {
        type: 'CASE',
        id: f,
        st: st
    }
}

/*
  Estructura interna del hash
*/

tuplahash = c:ID DP v:valor {
    return {
      key: c,
      valor: v
    };
}

/*
  Tipo de dato que puede ser una cadena, un ID, o un numero
*/

valor = id:ID { return id; }
        / n:NUMBER { return n; }

assign = i:ID ASSIGN e:cond
            { return {type: '=', left: i, right: e}; }
       / cond

cond = izq:exp op:COMP der:exp { return { type: op, left: izq, right: der} }
     / exp

exp    = t:term   r:(ADD term)*   { return tree(t,r); }
term   = f:factor r:(MUL factor)* { return tree(f,r); }

/*
a = [1,2][0]
{a:1}.a
*/

factor = NUMBER
       / f:ID LEFTPAR a:assign? r:(COMMA assign)* RIGHTPAR
         {
           let t = [];
           if (a) t.push(a);
           return {
             type: 'CALL',
             func: f,
             arguments: t.concat(r.map(([_, exp]) => exp))
           }
         }
       / ID

       /*
          Hashes:
          {hola : 5, programa : peg};
       */

       / CL t:tuplahash? r:(COMMA tuplahash)* CR {
            let claves = t? [t] : [];
            claves = claves.concat(r.map( ([_, t]) => t));
            return {
              type: 'HASH',
              claves: claves
            };
       }

       / LEFTPAR t:assign RIGHTPAR   { return t; }

_ = $[ \t\n\r]*

ASSIGN   = _ op:'=' _  { return op; }
ADD      = _ op:[+-] _ { return op; }
MUL      = _ op:[*/] _ { return op; }
LEFTPAR  = _"("_
RIGHTPAR = _")"_
CL       = _"{"_
CR       = _"}"_
SC       = _";"+_
COMMA    = _","_
COMP     = _ op:("=="/"!="/"<="/">="/"<"/">") _ {
               return op;
            }
IF       = _ "if" _
THEN     = _ "then" _
ELSE     = _ "else" _
WHILE    = _ "while" _
DO       = _ "do" _
FOR      = _ "for" _
TO       = _ "to" _
RETURN   = _ "return" _
SWITCH   = _ "switch" _
CASE     = _ "case" _
DP       = _ ":" _
BREAK    = _ "break" _
HASH     = _ "hash" _
VAR      = _ "var" _
CONST    = _ "const" _
FUNCTION = _ "function" _
ID       = _ id:$([a-zA-Z_][a-zA-Z_0-9]*) _
            {
              return { type: 'ID', value: id };
            }
NUMBER   = _ digits:$[0-9]+ _
            {
              return { type: 'NUM', value: parseInt(digits, 10) };
            }
