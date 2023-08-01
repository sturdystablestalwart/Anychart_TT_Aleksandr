
function startCharting(pointsMeasurementsBundle, pointsData){
    const svg = document.getElementById('linechart');
    
    if (svg.childElementCount != 0){
        while (svg.hasChildNodes()) {
            svg.removeChild(svg.lastChild);
        }
    }

    const canvasParameters = findDimentions(svg);
    drawMainLine(pointsData, canvasParameters, pointsMeasurementsBundle, svg);
    drawXAxes(canvasParameters, svg);
    drawYAxes(canvasParameters, svg); // TODO solve bug with the mainLine leaving the canvas
}

function findDimentions(svg){
    const svgHeight = svg.getBoundingClientRect().height;
    const svgWidth = svg.getBoundingClientRect().width;

    const canvasHeight = svgHeight * 0.9;
    const canvasWidth = svgWidth * 0.9;
    const minX = (svgWidth - canvasWidth) / 2;
    const minY = (svgHeight - canvasHeight) / 2;

    const canvasParameters = {canvasHeight, canvasWidth, minX, minY};

    return canvasParameters;
}

function drawMainLine(pointsData, canvasParameters, pointsMeasurementsBundle, svg){

    const {canvasHeight, canvasWidth, minX, minY} = canvasParameters;

    let sectionLength = canvasWidth / (pointsMeasurementsBundle[0] - 1); // длина отрезка линии графика между точками
    
    let x = minX;
    let y = minY;
    let z = canvasHeight / (pointsMeasurementsBundle[1] - pointsMeasurementsBundle[2]); // приближение
        z = (z == Infinity) ? 1 : z;

    let yCentrationShift = minY;
    let ySubZeroCompensation = pointsMeasurementsBundle[2] * z;

    let d = 'M';
    pointsData.forEach(element => {        
        y = canvasHeight - element.value * z + ySubZeroCompensation + yCentrationShift;
        d += ' ' + x + ' ' + y;
        x += sectionLength;
    });

    const pathLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
          pathLine.setAttributeNS(null, "d", d);
          pathLine.setAttributeNS(null, "fill", "none");
          pathLine.setAttributeNS(null, "stroke", '#00A69F');
          pathLine.setAttributeNS(null, "stroke-width", 2);
    svg.appendChild(pathLine);
}

function drawXAxes(canvasParameters, svg){
    const {canvasHeight, minX, minY} = canvasParameters;

    let d = 'M ' + minX + ' ' + canvasHeight + ' ' + minX + ' ' + minY;

    const xAxesLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLine.setAttributeNS(null, "d", d);
          xAxesLine.setAttributeNS(null, "fill", "none");
          xAxesLine.setAttributeNS(null, "stroke", '#696969');
          xAxesLine.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLine);

    drawXAxesArrowPoint(minX, minY, svg);
}

function drawXAxesArrowPoint(minX, minY, svg){    
    const leftArrowWingPointCoordinates = ' ' + (minX - 3) + ' ' + (minY + 5);
    const rightArrowWingPointCoordinates = ' ' + (minX + 3) + ' ' + (minY + 5);

    d = 'M ' + minX + ' ' + minY + leftArrowWingPointCoordinates + rightArrowWingPointCoordinates + " Z";

    const xAxesLineArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLineArrow.setAttributeNS(null, "d", d);
          xAxesLineArrow.setAttributeNS(null, "fill", "#696969");
          xAxesLineArrow.setAttributeNS(null, "stroke", '#696969');
          xAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLineArrow);
}

function drawYAxes(canvasParameters, svg){
    const {canvasHeight, canvasWidth, minX} = canvasParameters;

    let d = 'M ' + minX + ' ' + canvasHeight + ' ' + canvasWidth + ' ' + canvasHeight;

    const xAxesLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLine.setAttributeNS(null, "d", d);
          xAxesLine.setAttributeNS(null, "fill", "none");
          xAxesLine.setAttributeNS(null, "stroke", '#696969');
          xAxesLine.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLine);

    drawYAxesArrowPoint(canvasWidth, canvasHeight, svg);
}

function drawYAxesArrowPoint(canvasWidth, canvasHeight, svg){    
    const heigherArrowWingPointCoordinates = ' ' + (canvasWidth - 5) + ' ' + (canvasHeight - 3);
    const lowerArrowWingPointCoordinates = ' ' + (canvasWidth - 5) + ' ' + (canvasHeight + 3);

    d = 'M ' + canvasWidth + ' ' + canvasHeight + heigherArrowWingPointCoordinates + lowerArrowWingPointCoordinates + " Z";

    const xAxesLineArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLineArrow.setAttributeNS(null, "d", d);
          xAxesLineArrow.setAttributeNS(null, "fill", "#696969");
          xAxesLineArrow.setAttributeNS(null, "stroke", '#696969');
          xAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLineArrow);
}