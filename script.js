$(document).ready(function () {
   let canvas = $("#canvas");
   let doorCounter = 1;
   let xOrSCounter = 1;
   let trasomCounter = 1;
   let deleteIcon = $(".delete-icon");
   let elemsData = [];
   let jsonDataTextArea = $("#jsonDataTextArea");
   let verticalCheckbox = $("#verticalCheckbox");
   let horizontalCheckbox = $("#horizontalCheckbox");
   let unlockAll = $("#unlockAll");
   let verticalDrag = false;
   let horizontalDrag = false;
   let generatedImage = null;


   let contextMenu = $("#contextMenu");

   document.getElementById('addTransom').addEventListener('click', () => addElement('Transom', 200, 100));
   document.getElementById('addDoorBtn').addEventListener('click', () => addElement('Door', 100, 200));
   $('#addXorS').on('click', addXorS);


   $(document).on("contextmenu", ".door, .transom, .xOrS", function (e) {
      e.preventDefault();
      deselectAllElements();
      $(this).addClass("selected"); // Select the right-clicked door

      contextMenu.css({
         top: e.pageY + "px",
         left: e.pageX + "px"
      }).show();

      return false;
   });

   $(document).on("click", function (event) {
      if (!$(event.target).closest('.door, .transom, #contextMenu').length) {
         deselectAllElements();
         $('#contextMenu').hide();
      }
   });

   $("#deleteBtn").click(function () {
      $(".door.selected,.transom.selected, .xOrS.selected").remove();
      contextMenu.hide();
   });

   // Function to bring the selected door to the front
   $("#bringToFrontBtn").click(function () {
      let selectedElem = $(".door.selected, .transom.selected, .xOrS.selected");
      if (selectedElem.length > 0) {
         selectedElem.parent().append(selectedElem);
      }
      contextMenu.hide();
   });


   function addXorS() {
      const xOrS = $('<div/>', {
         class: 'xOrS',
         id: 'xOrS-' + xOrSCounter,
         text: xOrSCounter
      }).css({
         top: ($('#canvas').height() / 2) - 12.5, // Centering the div vertically
         left: ($('#canvas').width() / 2) - 12.5 // Centering the div horizontally
      })

      xOrS.on('dblclick', function () {
         $('#myModal').modal('show');
      });

      $('#canvas').append(xOrS);
      xOrS.draggable();
      xOrSCounter++;
   }

   //Add Element (e.g. Door , Transom)
   function addElement(type, elemwidth, elemheight) {
      const color = type === 'Door' ? '#9ccc65' : 'lightpurple';
      const canvasWidth = canvas.width();
      const canvasHeight = canvas.height();
      let newElem = $("<div>").addClass(`${type.toLowerCase()}`);
      // Add door name to the door div
      let elemName = $("<span>").addClass(`${type.toLowerCase()}-name`).text(type === 'Door' ? 'Door ' + doorCounter : '');
      newElem.append(elemName);
      // Add door info section
      let elemInfo = $("<div>").addClass(`${type.toLowerCase()}-info`);
      // Add the width field
      let widthContainer = $("<div>");
      let widthLabel = $("<label>").text("Wid");
      let widthInput = $("<input>").attr("type", "text").val(elemwidth);

      widthContainer.append(widthLabel, widthInput);
      widthInput.on("blur", function () {
         let newWidth = parseInt($(this).val());
         if (!isNaN(newWidth)) {
            newElem.css("width", newWidth + "px");
            updateElemDimensions(newElem);
         }
      });

      let elemDimensionsLabel = $("<span>").addClass(`${type.toLowerCase()}-dimensions`);
      // Add the height field
      let heightContainer = $("<div>");
      let heightLabel = $("<label>").text("Hgt");
      let heightInput = $("<input>").attr("type", "text").val(elemheight);
      heightContainer.append(heightLabel, heightInput);
      heightInput.on("blur", function () {
         let newHeight = parseInt($(this).val());
         if (!isNaN(newHeight)) {
            newElem.css("height", newHeight + "px");
            updateElemDimensions(newElem);

         }
      });
      elemInfo.append(widthContainer, heightContainer);
      newElem.append(elemInfo);

      canvas.append(newElem);

      // Center the new door in the canvas
      const xPos = (canvasWidth - elemheight) / 2;
      const yPos = (canvasHeight - elemwidth) / 2;
      newElem.css({
         top: yPos + "px",
         left: xPos + "px",
      });

      updateElemDimensionsLabel(elemwidth, elemheight, elemDimensionsLabel);
      elemInfo.append(elemDimensionsLabel);

      newElem.draggable({
         containment: "parent",
         drag: function (event, ui) {
            if (verticalDrag) {
               ui.position.left = ui.originalPosition.left;
            }
            if (horizontalDrag) {
               ui.position.top = ui.originalPosition.top;
            }
         }
      });
      // Increment the door counter for the next door
      if (type === 'Door') {
         doorCounter++;
      }
   }


   function deselectAllElements() {
      $(".door, .transom,  .xOrS").removeClass("selected");
   }


   $(document).on("click", ".door, .transom, .xOrS", function () {
      let element = $(this);
      if (!element.hasClass("selected")) {
         deselectAllElements();
         element.addClass("selected");
      }
   });

   $(document).on("click", function (event) {
      if (!$(event.target).closest(".door, .transom").length) {
         deselectAllElements();
      }
   });


   //Generate Button
   $("#generateBtn").click(function () {
      // Clear the canvas to regenerate doors
      canvas.empty();
      doorCounter = 1;
      // Parse JSON from the textarea
      let jsonData = jsonDataTextArea.val();
      try {
         elemsData = JSON.parse(jsonData);

         // Generate doors based on the data
         elemsData.forEach(function (doorData) {
            if (doorData.type !== 'Xors') {
               let type = doorData.type;
               if (type === 'Door') {
                  doorCounter++;
               }


               let newElem = $("<div>").addClass(`${type.toLowerCase()}`);
               let doorName = $("<span>").addClass(`${type.toLowerCase()}-name`).text(doorData.name);
               newElem.append(doorName);

               // Add door info section
               let doorInfo = $("<div>").addClass(`${type.toLowerCase()}-info`);

               // Add the width field
               let widthContainer = $("<div>");
               let widthLabel = $("<label>").text("Wid");
               let widthInput = $("<input>").attr("type", "text").val(doorData.width);
               widthContainer.append(widthLabel, widthInput);
               widthInput.on("blur", function () {
                  let newWidth = parseInt($(this).val());
                  if (!isNaN(newWidth)) {
                     newElem.css("width", newWidth + "px");
                     updateElemDimensions(newElem);
                  }
               });
               let doorDimensionsLabel = $("<span>").addClass(`${type.toLowerCase()}-dimensions`);


               // Add the height field
               let heightContainer = $("<div>");
               let heightLabel = $("<label>").text("Hgt");
               let heightInput = $("<input>").attr("type", "text").val(doorData.height);
               heightContainer.append(heightLabel, heightInput);
               heightInput.on("blur", function () {
                  let newHeight = parseInt($(this).val());
                  if (!isNaN(newHeight)) {
                     newElem.css("height", newHeight + "px");
                     updateElemDimensions(newElem);
                  }
               });


               doorInfo.append(widthContainer, heightContainer);
               newElem.append(doorInfo);
               updateElemDimensionsLabel(doorData.width, doorData.height, doorDimensionsLabel);
               doorInfo.append(doorDimensionsLabel);


               canvas.append(newElem);


               newElem.css({
                  top: doorData.position.top + "px",
                  left: doorData.position.left + "px",
                  width: widthInput.val() + "px", // Set width from the input value
                  height: heightInput.val() + "px", // Set height from the input value
               });

               newElem.draggable({
                  containment: "parent",
                  drag: function (event, ui) {
                     if (verticalDrag) {
                        ui.position.left = ui.originalPosition.left;
                     }
                     if (horizontalDrag) {
                        ui.position.top = ui.originalPosition.top;
                     }
                  }
               });
            } else {
               let newElem = $('<div/>', {
                  class: 'xOrS',
                  id: 'xOrS-' + doorData.value,
                  text: doorData.value
               }).css({
                  top: doorData.position.top + "px",
                  left: doorData.position.left + "px", // Centering the div horizontally
               });
               newElem.on('dblclick', function () {
                  $('#myModal').modal('show');
               });
               $('#canvas').append(newElem);
               newElem.draggable();
               xOrSCounter++

            }
         });
         xOrSCounter = Math.max(...elemsData.map(o => o.value)) + 1;
      } catch (error) {
         console.error("Error parsing JSON data:", error);
      }
   });


   function updateElemDimensions(element) {
      var type = $(element).attr('class').split(' ')[0].toLowerCase();
      let widthInput = element.find(`.${type}-info input[type='text']:eq(0)`);
      let heightInput = element.find(`.${type}-info input[type='text']:eq(1)`);
      let elemDimensionsLabel = element.find(`.${type}-info .${type}-dimensions`);

      let elemWidth = parseInt(widthInput.val());
      let elemHeight = parseInt(heightInput.val());

      element.css("width", elemWidth + "px");
      element.css("height", elemHeight + "px");

      updateElemDimensionsLabel(elemWidth, elemHeight, elemDimensionsLabel);
   }

   function updateElemDimensionsLabel(width, height, labelElement) {
      labelElement.text(width + "X" + height);
   }


   $("#generateImgBtn").click(function () {
      generateImage();
   });


   function generateImage() {
      let jsonData = JSON.parse($("#jsonDataTextArea").val());


      // Determine the bounds of the elements
      let minX = Math.min(...jsonData.map(element => element.position.left));
      let minY = Math.min(...jsonData.map(element => element.position.top));
      let maxX = Math.max(...jsonData.map(element => element.position.left + element.width));
      let maxY = Math.max(...jsonData.map(element => element.position.top + element.height));

      // Create the canvas with the size of the bounds
      let canvas = document.createElement("canvas");
      canvas.width = maxX - minX;
      canvas.height = maxY - minY;
      let ctx = canvas.getContext("2d");

      jsonData.forEach(function (element) {
         // Adjust the element positions based on the new origin (minX, minY)
         let adjustedLeft = element.position.left - minX;
         let adjustedTop = element.position.top - minY;
         if (element.type != "Xors") {
            // Draw the single border (1 pixel thick)
            ctx.strokeStyle = "black"; // Black color
            ctx.lineWidth = 1;
            ctx.strokeRect(adjustedLeft, adjustedTop, element.width - 2, element.height - 2);
            ctx.strokeRect(adjustedLeft + 5, adjustedTop + 5, element.width - 12, element.height - 12);

            // Add element name
            ctx.font = "10px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(element.name, adjustedLeft + 5, adjustedTop + 15);

            // Add element dimensions
            let dimensions = element.width + "X" + element.height;
            ctx.fillText(dimensions, adjustedLeft + 5, adjustedTop + 30);
         }


      });
      //Xors loop
      jsonData.forEach(function (element) {
         let adjustedLeft = element.position.left - minX;
         let adjustedTop = element.position.top - minY;
         if (element.type === "Xors") {
            ctx.fillStyle = 'grey';
            ctx.fillRect(adjustedLeft, adjustedTop, 25, 25);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.strokeRect(adjustedLeft, adjustedTop, 25, 25);
            ctx.strokeRect(adjustedLeft + 1, adjustedTop + 1, 23, 23);
            ctx.fillStyle = 'white'; // Text color
            ctx.font = 'bold 14px Arial'; // Bold font, adjust the size as needed
            ctx.fillText(element.value, adjustedLeft + 8, adjustedTop + 17);
         }

      });

      // Convert the canvas to an image
      let img = document.createElement("img");
      let dataURL = canvas.toDataURL("image/png");


      // Display the latest image in the document
      //document.body.appendChild(img);
      generatedImage = dataURL; // Update the reference to the new image
      $('#designImg').attr('src', dataURL);
   }


   verticalCheckbox.on("change", function () {
      verticalDrag = this.checked;
      if (this.checked) {
         horizontalCheckbox.prop("checked", false);
         horizontalDrag = false;
      }
   });

   unlockAll.on("change", function () {
      if (this.checked) {
         console.log('unlock All');
         horizontalCheckbox.prop("checked", false);
         horizontalDrag = false;
         verticalCheckbox.prop("checked", false);
         verticalDrag = false;
      }
   });

   horizontalCheckbox.on("change", function () {
      horizontalDrag = this.checked;
      if (this.checked) {
         verticalCheckbox.prop("checked", false);
         verticalDrag = false;
      }
   });


   $('#codeModal').on('show.bs.modal', function (e) {
      generateCode();
   });


   $('#imageModal').on('show.bs.modal', function (e) {
      generateCode();
      generateImage();
   });


   function generateCode() {
      elemsData = [];

      // Loop through each door to collect data
      $(".door, .transom, .xOrS").each(function () {
         let element = $(this);
         var type = toCapitalCase($(element).attr('class').split(' ')[0]);
         let elemName = element.find(".door-name").text();
         let elemWidth = element.width() + 10; // Use width() to get the current width of the door
         let elemHeight = element.height() + 10; // Use height() to get the current height of the door
         let elemPosition = element.position();
         let elemData = {
            name: elemName,
            width: elemWidth,
            height: elemHeight,
            type: type,
            value: (type === 'Xors') ? element.text() : 0,
            position: {
               left: Math.round(elemPosition.left),
               top: Math.round(elemPosition.top)
            }
         };
         elemsData.push(elemData);
      });

      // Generate JSON and display in the textarea
      let jsonData = JSON.stringify(elemsData, null, 2);
      jsonDataTextArea.val(jsonData); // Set JSON data as the value of the textarea
   }

   function toCapitalCase(str) {
      return str.replace(/\w\S*/g, function (txt) {
         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
   }

   $('#tglFullScreen').click(function () {
      toggleFullScreen();
   });

   function toggleFullScreen() {
      const imageContainer = document.querySelector('.image-container');

      if (!document.fullscreenElement) {
         imageContainer.requestFullscreen();
      } else {
         document.exitFullscreen();
      }
   }

});