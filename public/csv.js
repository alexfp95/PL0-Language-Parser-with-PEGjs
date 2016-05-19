// See http://en.wikipedia.org/wiki/Comma-separated_values
(() => {
"use strict"; // Use ECMAScript 5 strict mode in browsers that support it
var semantic = require ("semantic");

const resultTemplate = `
<div class="contenido">
      <table class="center" id="result">
          <% _.each(rows, (row) => { %>
          <tr class="<%=row.type%>">
              <% _.each(row.items, (name) =>{ %>
              <td><%= name %></td>
              <% }); %>
          </tr>
          <% }); %>
      </table>
  </p>
</div>
`;

/* Volcar la tabla con el resultado en el HTML */
const fillTable = (data) => {
  $("#finaltable").html(_.template(resultTemplate, { rows: data.rows }));
};

/* Volcar en la textarea de entrada
 * #original el contenido del fichero fileName */
const dump = (fileName) => {
  $.get(fileName, function (data) {
      $("#original").val(data);
  });
};

const handleFileSelect = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();

 var files = evt.target.files;

  var reader = new FileReader();
  reader.onload = (e) => {

    $("#original").val(e.target.result);
  };
  reader.readAsText(files[0])
}

/* Drag and drop: el fichero arrastrado se vuelca en la textarea de entrada */
const handleDragFileSelect = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();

  var files = evt.dataTransfer.files; // FileList object.

  var reader = new FileReader();
  reader.onload = (e) => {

    $("#original").val(e.target.result);
    evt.target.style.background = "white";
  };
  reader.readAsText(files[0])
}

const handleDragOver = (evt) => {
  evt.stopPropagation();
  evt.preventDefault();
  evt.target.style.background = "grey";
}

$(document).ready(() => {
    let original = document.getElementById("original");
    let finaltable = document.getElementById("finaltable");
    if (window.localStorage && localStorage.original) {
      original.value = localStorage.original;
    }

    /* Request AJAX para que se calcule la tabla 
   $("#parse").click( () => {
        if (window.localStorage) localStorage.original = original.value;
        $.get("/csv", /* Request AJAX para que se calcule la tabla 
          { input: original.value },
          fillTable,
          'json'
        );
   });*/
   $('#parse').click(function() {
    try {
            console.log("parse hecho");

      var result = pl0.parse($('#original').val());
       semantic(result);
     
      original.value = JSON.stringify(result,undefined,2);
     // $('#finaltable').html(JSON.stringify(result,undefined,2));
       finaltable.value = JSON.stringify(result,undefined,2);
      console.log("fuera");
    } catch (e) {
      $('#finaltable').html('<div class="error"><pre>\n' + JSON.stringify(e, null,4) + '\n</pre></div>');
    }
  });
   /* botones para rellenar el textarea */
    $('button.example').each((index, element) => {
     $(element).click(() => {
        dump(`${$(element).text()}.pl0`);
      });
   });

    // Setup the drag and drop listeners.
    //var dropZone = document.getElementsByClassName('drop_zone')[0];
    let dropZone = $('.drop_zone')[0];
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleDragFileSelect, false);
    let inputFile = $('.inputfile')[0];
    inputFile.addEventListener('change', handleFileSelect, false);
 });
})();
