function startCharting(pointsMeasurementsBundle, pointsData) {
  const svg = document.getElementById("linechart");
  const canvasParameters = calculateCanvasParameters();
  const pointCoordinatesBundle = calculatePointCoordinate(
    pointsData,
    canvasParameters,
    pointsMeasurementsBundle
  );

  resizeChart(svg);

  const tooltip = document.getElementById("tooltip");

  if (tooltip) {
    document.body.removeChild(tooltip);
  }

  if (svg.childElementCount != 0) {
    while (svg.hasChildNodes()) {
      svg.removeChild(svg.lastChild);
    }
  }

  initiateTooltip(
    pointsData,
    canvasParameters,
    pointsMeasurementsBundle,
    pointCoordinatesBundle,
    svg
  );
  drawMainLine(pointCoordinatesBundle, svg);
  manageAxes(canvasParameters, pointsMeasurementsBundle, pointsData, svg);
}

function resizeChart(svg) {
  const lineChartHieght = calculateLineChartHeight();
  const lineChartWidth = calculateLineChartWidth();
  svg.setAttribute(
    "style",
    `height: ${lineChartHieght}px; width: ${lineChartWidth}px;`
  );
  svg.setAttribute("display", `flex`);
}

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
    lineChartHieght,
    canvasHeight,
    canvasWidth,
    maxX,
    maxY,
    minX,
    minY,
  };

  return canvasParameters;
}

function calculatePointCoordinate(
  pointsData,
  canvasParameters,
  pointsMeasurementsBundle
) {
  const { canvasHeight, canvasWidth, maxY, minX, minY } = canvasParameters;
  const { pointsAmount, pointsMaxHeight, pointsMinHeight } =
    pointsMeasurementsBundle;

  const sectionLength = canvasWidth / pointsAmount; // расстояние между точками

  var x = minX + sectionLength / 2;
  var y = minY;
  const z =
    canvasHeight / (pointsMaxHeight - pointsMinHeight) == Infinity
      ? 1
      : canvasHeight / (pointsMaxHeight - pointsMinHeight); // приближение

  var ySubZeroCompensation = 0;
  if (pointsMinHeight < 0) {
    ySubZeroCompensation = pointsMinHeight * z - minY;
  }

  const pointCoordinatesBundle = [];

  pointsData.forEach((element) => {
    if (element.value == null) {
      return;
    }

    y = maxY - element.value * z + ySubZeroCompensation + minY;

    pointCoordinatesBundle.push({ x, y, z, ySubZeroCompensation });

    x += sectionLength;
  });

  return pointCoordinatesBundle;
}

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

function calculateLineChartWidth() {
  const totalWindowWidth = window.innerWidth;

  return totalWindowWidth;
}

function initiateTooltip(
  pointsData,
  canvasParameters,
  pointsMeasurementsBundle,
  pointCoordinatesBundle,
  svg
) {
  const tooltip = document.createElement("div");
  tooltip.setAttribute("id", "tooltip");
  tooltip.setAttribute("display", "none");
  tooltip.setAttribute(
    "style",
    "position: absolute; display: none;" +
      "background: #ffffff; border: 1px solid #696969; border-radius: 20px; padding: 5px; color: #696969"
  );
  document.body.insertBefore(tooltip, svg);

  const circleList = createPointMarkers(
    pointsData,
    canvasParameters,
    pointsMeasurementsBundle,
    pointCoordinatesBundle,
    svg
  );
  const reactangleList = createTargetrectaAngles(
    canvasParameters,
    pointsMeasurementsBundle,
    svg
  );

  reactangleList.forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      let index = reactangleList.indexOf(element);
      let circle = circleList[index];
      let x = pointsData[index].x;
      let value = pointsData[reactangleList.indexOf(element)].value;
      let text = `Name: ${x}, Value: ${value}`;

      showTooltip(event, text, circle);
    });
    element.addEventListener("mouseout", () => {
      let index = reactangleList.indexOf(element);
      let circle = circleList[index];

      hideTooltip(circle);
    });
  });
}

function showTooltip(event, text, circle) {
  let tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = event.pageX + 10 + "px";
  tooltip.style.top = event.pageY + 10 + "px";

  if (circle == undefined) {
    return;
  }
  circle.setAttributeNS(null, "fill", "#00A69F");
  circle.setAttributeNS(null, "stroke", "#1246B4");
}

function hideTooltip(circle) {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";

  if (circle == undefined) {
    return;
  }
  circle.setAttributeNS(null, "fill", "none");
  circle.setAttributeNS(null, "stroke", "none");
}

function createPointMarkers(
  pointsData,
  canvasParameters,
  pointsMeasurementsBundle,
  pointCoordinatesBundle,
  svg
) {
  let circleList = [];

  pointCoordinatesBundle.forEach((element) => {
    if (element.value == null) {
      return;
    }

    let pointCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    pointCircle.setAttributeNS(null, "cx", x);
    pointCircle.setAttributeNS(null, "cy", y);
    pointCircle.setAttributeNS(null, "r", "5px");
    pointCircle.setAttributeNS(null, "style", "pointer-events: none;");
    pointCircle.setAttributeNS(null, "fill", "none");
    pointCircle.setAttributeNS(null, "stroke", "none");
    svg.appendChild(pointCircle);

    circleList.push(pointCircle);
    x += sectionLength;
  });
  return circleList;
}

function createTargetrectaAngles(
  canvasParameters,
  pointsMeasurementsBundle,
  svg
) {
  const { canvasHeight, canvasWidth, minX, minY } = canvasParameters;
  const { pointsAmount } = pointsMeasurementsBundle;

  let sectionLength = canvasWidth / pointsAmount;
  let x = minX;
  let y = minY;

  const reactangleList = [];

  for (let index = pointsAmount; index > 0; index--) {
    let targetRectangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    targetRectangle.setAttributeNS(null, "x", x);
    targetRectangle.setAttributeNS(null, "y", y);
    targetRectangle.setAttributeNS(null, "width", sectionLength);
    targetRectangle.setAttributeNS(null, "height", canvasHeight);
    targetRectangle.setAttributeNS(null, "style", "pointer-events: all;");
    targetRectangle.setAttributeNS(null, "fill", "none");
    targetRectangle.setAttributeNS(null, "stroke", "none");
    svg.appendChild(targetRectangle);

    reactangleList.push(targetRectangle);
    x += sectionLength;
  }

  return reactangleList;
}

function drawMainLine(pointCoordinatesBundle, svg) {
  let d = "M";

  pointCoordinatesBundle.forEach((element) => {
    if (element.y === null) {
      return;
    }

    x = element.x;
    y = element.y;
    d += " " + x + " " + y;
  });

  const pathLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathLine.setAttributeNS(null, "d", d);
  pathLine.setAttributeNS(null, "fill", "none");
  pathLine.setAttributeNS(null, "style", "pointer-events: none;");
  pathLine.setAttributeNS(null, "stroke", "#00A69F");
  pathLine.setAttributeNS(null, "stroke-width", 2);
  svg.appendChild(pathLine);
}

/* Axes drawing section */
function manageAxes(
  canvasParameters,
  pointsMeasurementsBundle,
  pointsData,
  svg
) {
  const { pointsAmount } = pointsMeasurementsBundle;
  const { maxX, maxY, minX, minY } = canvasParameters;

  drawYAxes(maxY, minX, minY, svg);
  drawYAxesArrowPoint(minX, minY, svg);
  drawYTicks(canvasParameters, pointsMeasurementsBundle, svg);

  drawXAxes(maxX, maxY, minX, svg);
  drawXAxesArrowPoint(maxX, maxY, svg);
  drawXTicks(canvasParameters, pointsAmount, pointsData, svg);
}

function drawYAxes(maxY, minX, minY, svg) {
  const d = "M " + minX + " " + maxY + " " + minX + " " + minY;

  const xAxesLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  xAxesLine.setAttributeNS(null, "d", d);
  xAxesLine.setAttributeNS(null, "fill", "none");
  xAxesLine.setAttributeNS(null, "stroke", "#696969");
  xAxesLine.setAttributeNS(null, "stroke-width", 1);
  svg.appendChild(xAxesLine);
}

function drawYTicks(canvasParameters, pointsMeasurementsBundle, svg) {
  const { canvasHeight, maxY, minX } = canvasParameters;

  const ticksCount = 6;
  const tickInterval = canvasHeight / ticksCount;

  let y = maxY;

  let d = "M";

  const ticksYCoords = [y];

  for (let index = 0; index < ticksCount; index++) {
    let x = minX;
    d += " " + x + " " + y + " H";
    x -= 3;
    d += " " + x + " M";
    y -= tickInterval;

    ticksYCoords.push(y);
  }

  d = d.slice(0, -2);
  ticksYCoords.pop();

  const yAxesLineTicks = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  yAxesLineTicks.setAttributeNS(null, "d", d);
  yAxesLineTicks.setAttributeNS(null, "fill", "none");
  yAxesLineTicks.setAttributeNS(null, "stroke", "#696969");
  yAxesLineTicks.setAttributeNS(null, "stroke-width", 1);
  svg.appendChild(yAxesLineTicks);

  labelYTicks(ticksYCoords, canvasParameters, pointsMeasurementsBundle, svg);
}

function labelYTicks(
  ticksYCoords,
  canvasParameters,
  pointsMeasurementsBundle,
  svg
) {
  //TODO change calc here to pointCoordinatesBundle
  const { canvasHeight, minX, minY, maxY } = canvasParameters;
  const { pointsMaxHeight, pointsMinHeight } = pointsMeasurementsBundle;

  const x = minX - minX / 2;

  let z = canvasHeight / (pointsMaxHeight - pointsMinHeight); // приближение
  z = z == Infinity ? 1 : z;

  let ySubZeroCompensation = 0;
  if (pointsMinHeight < 0) {
    ySubZeroCompensation = pointsMinHeight * z - minY;
  }

  ticksYCoords.forEach((element) => {
    const y = element;

    const text = Math.round((maxY + ySubZeroCompensation + minY - y) / z);

    const labelYText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    const textNode = document.createTextNode(text);
    labelYText.setAttributeNS(null, "x", x);
    labelYText.setAttributeNS(null, "y", y);
    labelYText.setAttributeNS(null, "dominant-baseline", "middle");
    labelYText.setAttributeNS(null, "text-anchor", "middle");
    labelYText.setAttributeNS(null, "fill", "#696969");
    labelYText.appendChild(textNode);
    svg.appendChild(labelYText);
  });
}

function drawYAxesArrowPoint(minX, minY, svg) {
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

  const xAxesLineArrow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  xAxesLineArrow.setAttributeNS(null, "d", d);
  xAxesLineArrow.setAttributeNS(null, "fill", "#696969");
  xAxesLineArrow.setAttributeNS(null, "stroke", "#696969");
  xAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
  svg.appendChild(xAxesLineArrow);
}

function drawXAxes(maxX, maxY, minX, svg) {
  const d = "M " + minX + " " + maxY + " " + maxX + " " + maxY;

  const xAxesLine = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  xAxesLine.setAttributeNS(null, "d", d);
  xAxesLine.setAttributeNS(null, "fill", "none");
  xAxesLine.setAttributeNS(null, "stroke", "#696969");
  xAxesLine.setAttributeNS(null, "stroke-width", 1);
  svg.appendChild(xAxesLine);
}

function drawXAxesArrowPoint(maxX, maxY, svg) {
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

  const xAxesLineArrow = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  xAxesLineArrow.setAttributeNS(null, "d", d);
  xAxesLineArrow.setAttributeNS(null, "fill", "#696969");
  xAxesLineArrow.setAttributeNS(null, "stroke", "#696969");
  xAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
  svg.appendChild(xAxesLineArrow);
}

function drawXTicks(canvasParameters, pointsAmount, pointsData, svg) {
  const { canvasWidth, maxY, minX } = canvasParameters;

  let sectionLength = canvasWidth / pointsAmount; // расстояние между точками

  let x = minX + sectionLength / 2;

  const ticksXCoords = [x];

  let d = "M";
  for (let index = pointsAmount; index != 0; index--) {
    let y = maxY;
    d += " " + x + " " + y + " V";
    y += 3;
    d += " " + y + " M";
    x += sectionLength;

    ticksXCoords.push(x);
  }

  d = d.slice(0, -2);
  ticksXCoords.pop();

  const xAxesLineTicks = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  xAxesLineTicks.setAttributeNS(null, "d", d);
  xAxesLineTicks.setAttributeNS(null, "fill", "none");
  xAxesLineTicks.setAttributeNS(null, "stroke", "#696969");
  xAxesLineTicks.setAttributeNS(null, "stroke-width", 1);
  svg.appendChild(xAxesLineTicks);

  labelXTicks(ticksXCoords, canvasParameters, pointsData, svg);
}

function labelXTicks(ticksXCoords, canvasParameters, pointsData, svg) {
  ticksXCoords.forEach((element) => {
    const index = ticksXCoords.indexOf(element);
    const x = element;
    const y = canvasParameters.maxY + canvasParameters.minY / 2;

    const labelXText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    const textNode = document.createTextNode(pointsData[index].x);
    labelXText.setAttributeNS(null, "x", x);
    labelXText.setAttributeNS(null, "y", y);
    labelXText.setAttributeNS(null, "dominant-baseline", "middle");
    labelXText.setAttributeNS(null, "text-anchor", "middle");
    labelXText.setAttributeNS(null, "fill", "#696969");
    labelXText.appendChild(textNode);
    svg.appendChild(labelXText);
  });
}
