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

function lightUpCircleMarker(event) {
  const rectangle = event.target;

  const circleIndex = +rectangle.getAttributeNS(null, "circleIndex");

  const circle = document.querySelector(
    `circle#circlePointMarker:nth-of-type(${circleIndex + 1})`
  );
  circle.setAttributeNS(null, "fill", "#00A69F");
  circle.setAttributeNS(null, "stroke", "#1246B4");
}
function hideCircleMarker(event) {
  const rectangle = event.target;

  const circleIndex = +rectangle.getAttributeNS(null, "circleIndex");

  const circle = document.querySelector(
    `circle#circlePointMarker:nth-of-type(${circleIndex + 1})`
  );

  circle.setAttributeNS(null, "fill", "none");
  circle.setAttributeNS(null, "stroke", "none");
}

function showTooltip(event) {
  const tooltip = document.getElementById("tooltip");
  const rectangle = event.target;
  const text = rectangle.getAttributeNS(null, "tooltipText");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = event.pageX + 10 + "px";
  tooltip.style.top = event.pageY + 10 + "px";
}

function hideTooltip(event) {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
}

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

function manageMainLineAndPointMarkers(pointCoordinatesBundle, svg) {
  drawMainLine(pointCoordinatesBundle, svg);
  createPointMarkers(pointCoordinatesBundle, svg);
}

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
