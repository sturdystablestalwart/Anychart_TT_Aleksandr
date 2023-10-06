/**
 * The main function to draw the chart.
 * It starts all the other functions.
 *
 * @param {array} pointsMeasurementsBundle
 * @param {array} pointsData
 */
function startCharting(pointsMeasurementsBundle, pointsData) {
  const svg = document.getElementById("linechart");

  const canvasParameters = calculateCanvasParameters();
  const pointCoordinatesBundle = calculatePointCoordinate(
    pointsData,
    canvasParameters,
    pointsMeasurementsBundle
  );

  resizeChart(svg);

  manageMainLineAndPointMarkers(pointCoordinatesBundle, svg);
  manageAxes(
    canvasParameters,
    pointsMeasurementsBundle,
    pointCoordinatesBundle,
    pointsData,
    svg
  );
  manageTooltip(
    pointsData,
    canvasParameters,
    pointsMeasurementsBundle,
    pointCoordinatesBundle,
    svg
  );
}

/**
 * Calculates the size of svg that it can have.
 *
 * @param {object} svg
 */
function resizeChart(svg) {
  const lineChartHieght = calculateLineChartHeight();
  const lineChartWidth = calculateLineChartWidth();
  svg.setAttribute(
    "style",
    `height: ${lineChartHieght}px; width: ${lineChartWidth}px;`
  );
  svg.setAttribute("display", `flex`);
}

/**
 * Calculates the parameters that define the canvas
 * canvas is the arrea for the line of the chart to go in
 *
 * @returns {array} an array that holds in it:
 *
 * the height of a canvas ,
 * the width of a canvas,
 * the furthest from 0 X-axis coordinate to be used in the bounds of a canvas,
 * the furthest from 0 Y-axis coordinate to be used in the bounds of a canvas,
 * the nearest from 0 X-axis coordinate to be used in the bounds of a canvas,
 * the nearest from 0 Y-axis coordinate to be used in the bounds of a canvas
 */
function calculateCanvasParameters() {
  const lineChartHieght = calculateLineChartHeight();
  const lineChartWidth = calculateLineChartWidth();

  const canvasHeight = lineChartHieght * 0.9;
  const canvasWidth = lineChartWidth * 0.9;
  const minX = (lineChartWidth - canvasWidth) / 2;
  const maxX = minX + canvasWidth;
  const minY = (lineChartHieght - canvasHeight) / 2;
  const maxY = minY + canvasHeight;

  const canvasParameters = {
    canvasHeight,
    canvasWidth,
    maxX,
    maxY,
    minX,
    minY,
  };

  return canvasParameters;
}

/**
 * Calculates the coordinates of point inside the svg,
 * scale used to fit all the points in the chart, compensation so no points will be displayed
 * under the X axis, and the space between points, for every point.
 *
 * @param {array} pointsData
 * @param {array} canvasParameters
 * @param {array} pointsMeasurementsBundle
 * @returns {array} pointCoordinatesBundle {points X, points Y, scale, sub zero compensation, space between points}
 */
function calculatePointCoordinate(
  pointsData,
  canvasParameters,
  pointsMeasurementsBundle
) {
  const { canvasHeight, canvasWidth, maxY, minX, minY } = canvasParameters;
  const { pointsAmount, pointsMaxHeight, pointsMinHeight } =
    pointsMeasurementsBundle;

  const sectionLength = canvasWidth / pointsAmount;

  var x = minX + sectionLength / 2;
  var y = minY;
  const z =
    canvasHeight / (pointsMaxHeight - pointsMinHeight) == Infinity
      ? 1
      : canvasHeight / (pointsMaxHeight - pointsMinHeight);

  var ySubZeroCompensation = 0;
  if (pointsMinHeight < 0) {
    ySubZeroCompensation = pointsMinHeight * z - minY;
  }

  const pointCoordinatesBundle = [];

  pointsData.forEach((element) => {
    y = maxY - element.value * z + ySubZeroCompensation + minY;

    if (element.value == null) {
      y = null;
    }

    pointCoordinatesBundle.push({
      x,
      y,
      z,
      ySubZeroCompensation,
      sectionLength,
    });

    x += sectionLength;
  });

  return pointCoordinatesBundle;
}

/**
 * Calculates height that the lineChart svg can have
 *
 * to calculate lineChart height, window.innerHeight and
 * calculated summ of heights of other elements on the page are used
 *
 * @returns {number}
 */
function calculateLineChartHeight() {
  const totalWindowHeight = window.innerHeight;
  const h1 = document.querySelector("h1");

  const h1Styles = window.getComputedStyle(h1);
  const h1TopAndBottomMargin =
    parseFloat(h1Styles["marginTop"]) + parseFloat(h1Styles["marginBottom"]);
  const headerHeight = h1.offsetHeight + h1TopAndBottomMargin;

  const inputFieldHeight = document.getElementById("sourceURL").offsetHeight;

  const fullLineChartHieght =
    totalWindowHeight - headerHeight - inputFieldHeight;

  return fullLineChartHieght;
}

/**
 * Returns the availible for svg width
 * @returns {number} window.innerWidth
 */
function calculateLineChartWidth() {
  const totalWindowWidth = window.innerWidth;

  return totalWindowWidth;
}

/**
 * Manages tooltip, initiates tooltip, cretes targets, initiates listeners
 *
 * @param {array} pointsData
 * @param {object} canvasParameters
 * @param {array} pointsMeasurementsBundle
 * @param {array} pointCoordinatesBundle
 * @param {object} svg
 */
function manageTooltip(
  pointsData,
  canvasParameters,
  pointsMeasurementsBundle,
  pointCoordinatesBundle,
  svg
) {
  initiateTooltip(svg);
  createTargetRectangles(
    canvasParameters,
    pointsMeasurementsBundle,
    pointCoordinatesBundle,
    svg
  );
  initiateTooltipListeners(pointsData);
}
/**
 * Adds a tooltip to a page
 *
 * Does nothing if tooltip is already there
 *
 * @param {object} svg
 */
function initiateTooltip(svg) {
  const drawenTooltip = document.querySelector("#tooltip");

  if (drawenTooltip == undefined) {
    const tooltip = document.createElement("div");
    tooltip.setAttribute("id", "tooltip");
    tooltip.setAttribute("display", "none");
    tooltip.setAttribute(
      "style",
      "position: absolute; display: none;" +
        "background: #ffffff; border: 1px solid #696969; border-radius: 20px; padding: 5px; color: #696969"
    );
    document.body.insertBefore(tooltip, svg);
  }
}

/**
 * Places 4 listeners on each of the rectangles
 *
 * 1st listener is to catch the event of mouse being in a
 * proximity of a point and show a tooltip
 * 2nd listener is to catch the event of mouse being in a
 * proximity of a point and show a point marker
 *
 * 3rd listener is to catch an event of mouse leaving the proximity to hide a tooltip
 * 4th listener is to catch an event of mouse leaving the proximity to hide a point mmarker
 *
 * @param {array} pointsData
 */
function initiateTooltipListeners(pointsData) {
  const rectangleList = Array.from(
    document.querySelectorAll("#targetRectangle")
  );

  const counter = Math.min(rectangleList.length, pointsData.length);

  var circleIndex = 0;
  for (var index = 0; index < counter; index++) {
    const element = rectangleList[index];
    element.removeEventListener("mousemove", lightUpCircleMarker);
    element.removeEventListener("mouseout", hideCircleMarker);
    element.removeEventListener("mousemove", showTooltip);
    element.removeEventListener("mouseout", hideTooltip);

    const pointData = pointsData[index];
    const x = pointData.x;
    const value = pointData.value;
    const text = `Name: ${x}, Value: ${value}`;

    if (index > 0 && pointsData[index - 1].value == null) {
      circleIndex--;
    }

    if (value != null) {
      element.setAttributeNS(null, "circleIndex", circleIndex);
      element.addEventListener("mousemove", lightUpCircleMarker);
      element.addEventListener("mouseout", hideCircleMarker);
    }

    element.setAttributeNS(null, "tooltipText", text);
    element.addEventListener("mousemove", showTooltip);
    element.addEventListener("mouseout", hideTooltip);

    circleIndex++;
  }
}
/**
 * Handler for an event of mouse being in proximity(on target rectangle) of a point for showing the point marker
 * @param {object} event
 */
function lightUpCircleMarker(event) {
  const rectangle = event.target;

  const circleIndex = +rectangle.getAttributeNS(null, "circleIndex");

  const circle = document.querySelector(
    `circle#circlePointMarker:nth-of-type(${circleIndex + 1})`
  );
  circle.setAttributeNS(null, "fill", "#00A69F");
  circle.setAttributeNS(null, "stroke", "#1246B4");
}

/**
 * Handler for an event of mouse moved out of proximity(on target rectangle) of a point for hiding the point marker
 * @param {object} event
 */
function hideCircleMarker(event) {
  const rectangle = event.target;

  const circleIndex = +rectangle.getAttributeNS(null, "circleIndex");

  const circle = document.querySelector(
    `circle#circlePointMarker:nth-of-type(${circleIndex + 1})`
  );

  circle.setAttributeNS(null, "fill", "none");
  circle.setAttributeNS(null, "stroke", "none");
}

/**
 * Handler for an event of mouse being in proximity(on target rectangle) of a point for showing the tooltip
 * @param {object} event
 */
function showTooltip(event) {
  const tooltip = document.getElementById("tooltip");
  const rectangle = event.target;
  const text = rectangle.getAttributeNS(null, "tooltipText");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = event.pageX + 10 + "px";
  tooltip.style.top = event.pageY + 10 + "px";
}

/**
 * Handler for an event of mouse moved out of proximity(on target rectangle) of a point for hiding the tooltip
 */
function hideTooltip() {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
}
/**
 * Creates rectangles to place listeners to
 *
 * Accomodates for the possibility of different amounts of points for different redraws
 *
 * @param {object} canvasParameters
 * @param {array} pointsMeasurementsBundle
 * @param {array} pointCoordinatesBundle
 * @param {object} svg
 */
function createTargetRectangles(
  canvasParameters,
  pointsMeasurementsBundle,
  pointCoordinatesBundle,
  svg
) {
  const targetRectangles = Array.from(
    document.querySelectorAll("#targetRectangle")
  );

  const { canvasHeight, minX, minY } = canvasParameters;
  const { pointsAmount } = pointsMeasurementsBundle;
  const { sectionLength } = pointCoordinatesBundle[0];

  var x = minX;
  const y = minY;

  var rectanglesHtmlString = "";

  if (pointsAmount > targetRectangles.length) {
    if (targetRectangles.length == 0) {
      for (var index = 0; index < pointsAmount; index++) {
        rectanglesHtmlString += `<rect
            id="targetRectangle"
            x="${x}"
            y="${y}"
            width="${sectionLength}"
            height="${canvasHeight}"
            pointer-events="all"
            fill="none"
            stroke="none"
          ></rect>`;
        x += sectionLength;
      }
      svg.innerHTML += rectanglesHtmlString;
    } else {
      for (var index = 0; index < targetRectangles.length; index++) {
        const element = targetRectangles[index];
        element.setAttributeNS(null, "x", x);
        element.setAttributeNS(null, "y", y);
        element.setAttributeNS(null, "width", sectionLength);
        element.setAttributeNS(null, "heigh", canvasHeight);
        element.setAttributeNS(null, "pointer-events", "all");

        x += sectionLength;
      }
      for (var index = targetRectangles.length; index < pointsAmount; index++) {
        rectanglesHtmlString += `<rect
            id="targetRectangle"
            x="${x}"
            y="${y}"
            width="${sectionLength}"
            height="${canvasHeight}"
            pointer-events="all"
            stroke="none"
          ></rect>`;
        x += sectionLength;
      }
      svg.innerHTML += rectanglesHtmlString;
    }
  } else if (pointsAmount == targetRectangles.length) {
    targetRectangles.forEach((element) => {
      element.setAttributeNS(null, "x", x);
      element.setAttributeNS(null, "y", y);
      element.setAttributeNS(null, "width", sectionLength);
      element.setAttributeNS(null, "heigh", canvasHeight);
      element.setAttributeNS(null, "pointer-events", "all");

      x += sectionLength;
    });
  } else if (pointsAmount < targetRectangles.length) {
    for (var index = 0; index < pointsAmount; index++) {
      const element = targetRectangles[index];
      element.setAttributeNS(null, "x", x);
      element.setAttributeNS(null, "y", y);
      element.setAttributeNS(null, "width", sectionLength);
      element.setAttributeNS(null, "heigh", canvasHeight);
      element.setAttributeNS(null, "pointer-events", "all");

      x += sectionLength;
    }
    for (var index = pointsAmount; index < targetRectangles.length; index++) {
      const element = targetRectangles[index];
      element.setAttributeNS(null, "pointer-events", "none");
    }
  }
}

/**
 * Manager for main line and for markers on main line.
 * @param {array} pointCoordinatesBundle
 * @param {object} svg
 */
function manageMainLineAndPointMarkers(pointCoordinatesBundle, svg) {
  drawMainLine(pointCoordinatesBundle, svg);
  createPointMarkers(pointCoordinatesBundle, svg);
}

/**
 * (re)Draws the main line on the linchart
 *
 * Uses coordinates from pointCoordinatesBundle to write a string suiteble for
 * attribute d in path tag.
 *
 * If an elemnt with the id mainLine already exists set current d with new value
 * If not creates and then sets the d
 *
 * @param {array} pointCoordinatesBundle
 * @param {object} svg
 */
function drawMainLine(pointCoordinatesBundle, svg) {
  var mainLine = document.querySelector("#mainLine");

  var d = "M";
  pointCoordinatesBundle.forEach((element, index) => {
    if (element.y === null) {
      if (
        pointCoordinatesBundle[index - 1] == undefined ||
        pointCoordinatesBundle[index + 1] == undefined
      ) {
        return;
      }
      d += " " + "M";
      return;
    }

    x = element.x;
    y = element.y;
    d += " " + x + " " + y;
  });

  if (mainLine == undefined) {
    mainLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    mainLine.setAttributeNS(null, "id", "mainLine");
    mainLine.setAttributeNS(null, "d", d);
    mainLine.setAttributeNS(null, "fill", "none");
    mainLine.setAttributeNS(null, "style", "pointer-events: none;");
    mainLine.setAttributeNS(null, "stroke", "#00A69F");
    mainLine.setAttributeNS(null, "stroke-width", 2);
    svg.appendChild(mainLine);
  } else {
    mainLine.setAttributeNS(null, "d", d);
  }
}

/**
 * (re)Draws point markers on the main line on the linchart
 *
 * Uses coordinates from pointCoordinatesBundle to create a suitable string to
 * place into innerHTML of an svg
 *
 * Accomodates for the possibility of different amounts of points for different redraws
 *
 * @param {array} pointCoordinatesBundle
 * @param {object} svg
 */
function createPointMarkers(pointCoordinatesBundle, svg) {
  const circleList = Array.from(
    document.querySelectorAll("#circlePointMarker")
  );

  var circlesHtmlString = "";

  const noNullpointCoordinatesBundle = pointCoordinatesBundle.filter(
    (element) => element.y != null
  );

  if (noNullpointCoordinatesBundle.length > circleList.length) {
    if (circleList.length == 0) {
      noNullpointCoordinatesBundle.forEach((element) => {
        const cx = element.x;
        const cy = element.y;

        circlesHtmlString += `<circle
          id="circlePointMarker"
          cx="${cx}"
          cy="${cy}"
          r="5px"
          style="pointer-events: none;"
          fill="none"
          stroke="none"
        ></circle>`;
      });
      svg.innerHTML += circlesHtmlString;
    } else {
      for (var index = 0; index < circleList.length; index++) {
        const element = noNullpointCoordinatesBundle[index];

        const circle = circleList[index];
        const cx = element.x;
        const cy = element.y;

        circle.setAttributeNS(null, "cx", cx);
        circle.setAttributeNS(null, "cy", cy);
        circle.removeAttributeNS(null, "display");
      }

      for (
        var index = circleList.length;
        index < noNullpointCoordinatesBundle.length;
        index++
      ) {
        const element = noNullpointCoordinatesBundle[index];
        const cx = element.x;
        const cy = element.y;

        circlesHtmlString += `<circle 
          id="circlePointMarker"
          cx="${cx}"
          cy="${cy}"
          r="5px"
          style="pointer-events: none;"
          fill="none"
          stroke="none"
        ></circle>`;
      }
      svg.innerHTML += circlesHtmlString;
    }
  } else if (noNullpointCoordinatesBundle.length == circleList.length) {
    noNullpointCoordinatesBundle.forEach((element, index) => {
      const circle = circleList[index];
      const cx = element.x;
      const cy = element.y;

      circle.setAttributeNS(null, "cx", cx);
      circle.setAttributeNS(null, "cy", cy);
      circle.removeAttributeNS(null, "display");
    });
  } else {
    for (var index = 0; index < noNullpointCoordinatesBundle.length; index++) {
      const circle = circleList[index];
      const element = noNullpointCoordinatesBundle[index];
      const cx = element.x;
      const cy = element.y;

      circle.setAttributeNS(null, "cx", cx);
      circle.setAttributeNS(null, "cy", cy);
    }
    for (
      var index = noNullpointCoordinatesBundle.length;
      index < circleList.length;
      index++
    ) {
      const circle = circleList[index];
      circle.setAttributeNS(null, "display", "none");
    }
  }
}

/**
 * Axes drawing manager
 *
 * Starts drawing and calculating functions
 *
 * @param {object} canvasParameters
 * @param {object} pointsMeasurementsBundle
 * @param {array} pointCoordinatesBundle
 * @param {array} pointsData
 * @param {object} svg
 */
function manageAxes(
  canvasParameters,
  pointsMeasurementsBundle,
  pointCoordinatesBundle,
  pointsData,
  svg
) {
  const { pointsAmount } = pointsMeasurementsBundle;
  const { maxX, maxY, minX, minY } = canvasParameters;

  drawYAxes(maxY, minX, minY, svg);
  drawYAxesArrowPoint(minX, minY, svg);

  const yAxesTicksCoordinates =
    calculateYAxesTicksCoordinates(canvasParameters);
  drawYTicks(yAxesTicksCoordinates, svg);
  const yAxesTicksValues = calculateYAxesTicksValues(
    yAxesTicksCoordinates,
    pointCoordinatesBundle,
    canvasParameters
  );
  labelYTicks(yAxesTicksCoordinates, yAxesTicksValues, svg);

  drawXAxes(maxX, maxY, minX, svg);
  drawXAxesArrowPoint(maxX, maxY, svg);

  const xAxesTicksCoordinates = calculateXAxesTicksCoordinates(
    canvasParameters,
    pointCoordinatesBundle,
    pointsAmount
  );
  drawXTicks(xAxesTicksCoordinates, svg);
  labelXTicks(xAxesTicksCoordinates, pointsData, svg);
}

/**
 * (re)Draws Y axis using path from (minX, maxY) to (minX, minY)
 *
 * Uses parameters to create a string suiteble for argument d in the path tag
 *
 * @param {number} maxY
 * @param {number} minX
 * @param {number} minY
 * @param {number} svg
 */
function drawYAxes(maxY, minX, minY, svg) {
  const yAxis = document.querySelector("#yAxis");

  const d = "M " + minX + " " + maxY + " " + minX + " " + minY;

  if (yAxis == undefined) {
    const yAxisLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    yAxisLine.setAttributeNS(null, "id", "yAxis");
    yAxisLine.setAttributeNS(null, "d", d);
    yAxisLine.setAttributeNS(null, "fill", "none");
    yAxisLine.setAttributeNS(null, "stroke", "#696969");
    yAxisLine.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(yAxisLine);
  } else {
    const yAxisLine = yAxis;
    yAxisLine.setAttributeNS(null, "d", d);
  }
}

/**
 * Calculates coordinates from which to start drawing ticks on the Y axis
 *
 * Each element of the resulting array is an object containing x and y coordinates and an interaval between ticks
 *
 * @param {object} canvasParameters
 * @returns {array} array of objects [{ x, y, tickInterval }...]
 */
function calculateYAxesTicksCoordinates(canvasParameters) {
  const { canvasHeight, maxY, minX } = canvasParameters;

  const ticksCount = 6;
  const tickInterval = canvasHeight / ticksCount;

  var y = maxY;
  var x = minX;

  const ticksCoords = [];

  for (var index = 0; index < ticksCount; index++) {
    ticksCoords.push({ x, y, tickInterval });
    y -= tickInterval;
  }
  return ticksCoords;
}

/**
 * (re)Draws Y axis ticks using path
 *
 * Uses yAxesTicksCoordinates to create a string suiteble for argument d in the path tag
 *
 * The length of a tick is statick and is 3px
 *
 * @param {array} yAxesTicksCoordinates
 * @param {object} svg
 */
function drawYTicks(yAxesTicksCoordinates, svg) {
  const yAxisTicks = document.querySelector("#yAxisTicks");

  var d = "M";

  yAxesTicksCoordinates.forEach((element) => {
    x = element.x;
    y = element.y;
    d += " " + x + " " + y + " H";
    x -= 3;
    d += " " + x + " M";
    y -= element.tickInterval;
  });
  d = d.slice(0, -2);

  if (yAxisTicks == undefined) {
    const yAxesLineTicks = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    yAxesLineTicks.setAttributeNS(null, "id", "yAxisTicks");
    yAxesLineTicks.setAttributeNS(null, "d", d);
    yAxesLineTicks.setAttributeNS(null, "fill", "none");
    yAxesLineTicks.setAttributeNS(null, "stroke", "#696969");
    yAxesLineTicks.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(yAxesLineTicks);
  } else {
    const yAxesLineTicks = yAxisTicks;
    yAxesLineTicks.setAttributeNS(null, "d", d);
  }
}

/**
 * Calculates values that should be displayd on the chart under each tick
 *
 * @param {array} yAxesTicksCoordinates
 * @param {array} pointCoordinatesBundle {points X, points Y, scale, sub zero compensation, space between points}
 * @param {object} canvasParameters
 * @returns {array}
 */
function calculateYAxesTicksValues(
  yAxesTicksCoordinates,
  pointCoordinatesBundle,
  canvasParameters
) {
  const { minY, maxY } = canvasParameters;

  const z = pointCoordinatesBundle[0].z;
  const ySubZeroCompensation = pointCoordinatesBundle[0].ySubZeroCompensation;

  const yAxesTicksValues = [];

  yAxesTicksCoordinates.forEach((element) => {
    const y = element.y;
    const text = Math.round((maxY + ySubZeroCompensation + minY - y) / z);

    yAxesTicksValues.push(text);
  });
  return yAxesTicksValues;
}
/**
 * (re)Draws Y axis tick labels using string by placing it in the innerHTML of svg object
 *
 * Uses parameters to create a string suiteble svg.innerHTML
 *
 * Accomodates for the possibility of a reDraw and instead of creating a new text node reuses old one
 *
 * The space between the tick and a ticklable is statick and is 5px
 *
 * @param {array} yAxesTicksCoordinates
 * @param {array} yAxesTicksValues
 * @param {object} svg
 */
function labelYTicks(yAxesTicksCoordinates, yAxesTicksValues, svg) {
  const yAxisTickLabels = Array.from(
    document.querySelectorAll("#yAxisTickLabel")
  );
  var textNodeString = "";

  if (yAxisTickLabels.length == 0) {
    yAxesTicksCoordinates.forEach((element, index) => {
      const y = element.y;
      const x = element.x - 5;

      const text = yAxesTicksValues[index];

      textNodeString += `<text 
      id="yAxisTickLabel"
      x="${x}" 
      y="${y}" 
      dominant-baseline="middle" 
      text-anchor="end" 
      fill="#696969"
      >${text}</text>`;
    });
    svg.innerHTML += textNodeString;
  } else {
    yAxisTickLabels.forEach((element, index) => {
      const yAxesTicksCoordinate = yAxesTicksCoordinates[index];
      const y = yAxesTicksCoordinate.y;
      const x = yAxesTicksCoordinate.x - 5;

      const text = yAxesTicksValues[index];
      element.setAttributeNS(null, "x", x);
      element.setAttributeNS(null, "y", y);
      element.innerHTML = text;
    });
  }
}
/**
 * (re)Draws Y axis arrowpoint using path
 *
 * Uses parameters to create a string suiteble for argument d in the path tag
 *
 * @param {number} minX
 * @param {number} minY
 * @param {object} svg
 */
function drawYAxesArrowPoint(minX, minY, svg) {
  const yAxesArrowPoint = document.querySelector("#yAxesArrowPoint");

  const leftArrowWingPointCoordinates = " " + (minX - 3) + " " + (minY + 5);
  const rightArrowWingPointCoordinates = " " + (minX + 3) + " " + (minY + 5);

  const d =
    "M " +
    minX +
    " " +
    minY +
    leftArrowWingPointCoordinates +
    rightArrowWingPointCoordinates +
    " Z";

  if (yAxesArrowPoint == undefined) {
    const yAxesLineArrow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    yAxesLineArrow.setAttributeNS(null, "id", "yAxesArrowPoint");
    yAxesLineArrow.setAttributeNS(null, "d", d);
    yAxesLineArrow.setAttributeNS(null, "fill", "#696969");
    yAxesLineArrow.setAttributeNS(null, "stroke", "#696969");
    yAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(yAxesLineArrow);
  } else {
    const yAxesLineArrow = yAxesArrowPoint;
    yAxesLineArrow.setAttributeNS(null, "d", d);
  }
}

/**
 * (re)Draws Y axis using path from (minX, maxY) to (maxX, maxY)
 *
 * Uses parameters to create a string suiteble for argument d in the path tag
 *
 * @param {number} maxX
 * @param {number} maxY
 * @param {number} minX
 * @param {object} svg
 */
function drawXAxes(maxX, maxY, minX, svg) {
  const xAxis = document.querySelector("#xAxis");
  const d = "M " + minX + " " + maxY + " " + maxX + " " + maxY;

  if (xAxis == undefined) {
    const xAxesLine = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    xAxesLine.setAttributeNS(null, "id", "xAxis");
    xAxesLine.setAttributeNS(null, "d", d);
    xAxesLine.setAttributeNS(null, "fill", "none");
    xAxesLine.setAttributeNS(null, "stroke", "#696969");
    xAxesLine.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLine);
  } else {
    const xAxesLine = xAxis;
    xAxesLine.setAttributeNS(null, "d", d);
  }
}
/**
 * (re)Draws X axis arrowpoint using path
 *
 * Uses parameters to create a string suiteble for argument d in the path tag
 *
 * @param {number} maxX
 * @param {number} maxY
 * @param {object} svg
 */
function drawXAxesArrowPoint(maxX, maxY, svg) {
  const xAxisArrowPoint = document.querySelector("#xAxisArrowPoint");

  const heigherArrowWingPointCoordinates = " " + (maxX - 5) + " " + (maxY - 3);
  const lowerArrowWingPointCoordinates = " " + (maxX - 5) + " " + (maxY + 3);

  const d =
    "M " +
    maxX +
    " " +
    maxY +
    heigherArrowWingPointCoordinates +
    lowerArrowWingPointCoordinates +
    " Z";

  if (xAxisArrowPoint == undefined) {
    const xAxesLineArrow = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    xAxesLineArrow.setAttributeNS(null, "id", "xAxisArrowPoint");
    xAxesLineArrow.setAttributeNS(null, "d", d);
    xAxesLineArrow.setAttributeNS(null, "fill", "#696969");
    xAxesLineArrow.setAttributeNS(null, "stroke", "#696969");
    xAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLineArrow);
  } else {
    const xAxesLineArrow = xAxisArrowPoint;
    xAxesLineArrow.setAttributeNS(null, "d", d);
  }
}

/**
 * Calculates values that should be displayd on the chart under each tick
 *
 * @param {object} canvasParameters
 * @param {array} pointCoordinatesBundle
 * @param {number} pointsAmount
 * @returns {array}
 */
function calculateXAxesTicksCoordinates(
  canvasParameters,
  pointCoordinatesBundle,
  pointsAmount
) {
  const { maxY } = canvasParameters;
  var { x, sectionLength } = pointCoordinatesBundle[0];

  const ticksCoords = [];

  for (var index = 0; index < pointsAmount; index++) {
    var y = maxY;
    ticksCoords.push({ x, y });
    x += sectionLength;
  }

  return ticksCoords;
}

/**
 * (re)Draws X axis ticks using path
 *
 * Uses xAxesTicksCoordinates to create a string suiteble for argument d in the path tag
 *
 * The length of a tick is statick and is 3px
 *
 * @param {array} xAxesTicksCoordinates
 * @param {object} svg
 */
function drawXTicks(xAxesTicksCoordinates, svg) {
  const xAxisTicks = document.querySelector("#xAxisTicks");

  var d = "M";
  xAxesTicksCoordinates.forEach((element) => {
    var x = element.x;
    var y = element.y;
    d += " " + x + " " + y + " V";
    y += 3;
    d += " " + y + " M";
  });

  d = d.slice(0, -2);

  if (xAxisTicks == undefined) {
    const xAxesLineTicks = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    xAxesLineTicks.setAttributeNS(null, "id", "xAxisTicks");
    xAxesLineTicks.setAttributeNS(null, "d", d);
    xAxesLineTicks.setAttributeNS(null, "fill", "none");
    xAxesLineTicks.setAttributeNS(null, "stroke", "#696969");
    xAxesLineTicks.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLineTicks);
  } else {
    const xAxesLineTicks = xAxisTicks;
    xAxesLineTicks.setAttributeNS(null, "d", d);
  }
}

/**
 * (re)Draws X axis tick labels using string by placing it in the innerHTML of svg object
 *
 * Uses parameters to create a string suiteble svg.innerHTML
 *
 * Accomodates for the possibility of a reDraw and instead of creating a new text node reuses old one
 * If there are too many nodes, uses as many as needed and "display: none"s the rest
 *
 * The space between the tick and a ticklable is statick and is 3px
 *
 * @param {array} xAxesTicksCoordinates
 * @param {array} pointsData
 * @param {object} svg
 */
function labelXTicks(xAxesTicksCoordinates, pointsData, svg) {
  const xAxisTickLabels = Array.from(
    document.querySelectorAll("#xAxisTickLabel")
  );
  var textNodeString = "";

  if (xAxesTicksCoordinates.length > xAxisTickLabels.length) {
    if (xAxisTickLabels.length == 0) {
      xAxesTicksCoordinates.forEach((element, index) => {
        const x = element.x;
        const y = element.y + 3;

        textNodeString += `<text 
      id="xAxisTickLabel"
      x="${x}" 
      y="${y}" 
      dominant-baseline="hanging" 
      text-anchor="middle" 
      fill="#696969"
      >${pointsData[index].x}</text>`;
      });
      svg.innerHTML += textNodeString;
    } else {
      for (var index = 0; index < xAxisTickLabels.length; index++) {
        const element = xAxisTickLabels[index];
        const xAxesTickCoordinates = xAxesTicksCoordinates[index];
        const x = xAxesTickCoordinates.x;
        const y = xAxesTickCoordinates.y + 3;

        const text = pointsData[index].x;
        element.setAttributeNS(null, "x", x);
        element.setAttributeNS(null, "y", y);
        element.removeAttributeNS(null, "display");
        element.innerHTML = text;
      }
      for (
        var index = xAxisTickLabels.length;
        index < xAxesTicksCoordinates.length;
        index++
      ) {
        const element = xAxisTickLabels[index];
        const x = element.x;
        const y = element.y + 3;

        textNodeString += `<text 
      id="xAxisTickLabel"
      x="${x}" 
      y="${y}" 
      dominant-baseline="hanging" 
      text-anchor="middle" 
      fill="#696969"
      >${pointsData[index].x}</text>`;
      }
      svg.innerHTML += textNodeString;
    }
  } else if (xAxesTicksCoordinates.length == xAxisTickLabels.length) {
    xAxisTickLabels.forEach((element, index) => {
      const xAxesTickCoordinates = xAxesTicksCoordinates[index];
      const x = xAxesTickCoordinates.x;
      const y = xAxesTickCoordinates.y + 3;

      const text = pointsData[index].x;
      element.setAttributeNS(null, "x", x);
      element.setAttributeNS(null, "y", y);
      element.removeAttributeNS(null, "display");
      element.innerHTML = text;
    });
  } else if (xAxesTicksCoordinates.length < xAxisTickLabels.length) {
    for (var index = 0; index < xAxesTicksCoordinates.length; index++) {
      const element = xAxisTickLabels[index];
      const xAxesTickCoordinates = xAxesTicksCoordinates[index];
      const x = xAxesTickCoordinates.x;
      const y = xAxesTickCoordinates.y + 3;

      const text = pointsData[index].x;
      element.setAttributeNS(null, "x", x);
      element.setAttributeNS(null, "y", y);
      element.removeAttributeNS(null, "display");
      element.innerHTML = text;
    }
    for (
      var index = xAxesTicksCoordinates.length;
      index < xAxisTickLabels.length;
      index++
    ) {
      const element = xAxisTickLabels[index];
      element.setAttributeNS(null, "display", "none");
    }
    svg.innerHTML += textNodeString;
  }
}
