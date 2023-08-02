
function startCharting(pointsMeasurementsBundle, pointsData){
    const svg = document.getElementById('linechart');
    
    if (svg.childElementCount != 0){
        while (svg.hasChildNodes()) {
            svg.removeChild(svg.lastChild);
        }
    }

    const canvasParameters = findDimentions(svg);
    drawMainLine(pointsData, canvasParameters, pointsMeasurementsBundle, svg);
    drawYAxes(canvasParameters, svg);
    drawXAxes(canvasParameters,pointsMeasurementsBundle, svg);
}

function findDimentions(svg){
    const svgHeight = svg.getBoundingClientRect().height;
    const svgWidth = svg.getBoundingClientRect().width;

    const canvasHeight = svgHeight * 0.9;
    const canvasWidth = svgWidth * 0.9;
    const minX = (svgWidth - canvasWidth) / 2;
    const maxX = minX + canvasWidth;
    const minY = (svgHeight - canvasHeight) / 2;
    const maxY = minY + canvasHeight;

    const canvasParameters = {canvasHeight, canvasWidth, maxX, maxY, minX, minY};

    return canvasParameters;
}

function drawMainLine(pointsData, canvasParameters, pointsMeasurementsBundle, svg){

    const {canvasHeight, canvasWidth, maxX, maxY, minX, minY} = canvasParameters;

    let sectionLength = canvasWidth / (pointsMeasurementsBundle[0]); // расстояние между точками
    
    let x = minX + sectionLength / 2;
    let y = minY;
    let z = canvasHeight / (pointsMeasurementsBundle[1] - pointsMeasurementsBundle[2]); // приближение
        z = (z == Infinity) ? 1 : z;

    let ySubZeroCompensation = 0;
    if (pointsMeasurementsBundle[2]<0) {
        ySubZeroCompensation = pointsMeasurementsBundle[2] * z - minY;
    }

    let d = 'M';
    pointsData.forEach( (element) => {        
        y = maxY - element.value * z + ySubZeroCompensation  + minY;
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

/* Axes drawing section */
function drawYAxes(canvasParameters, svg){
    const {maxY, minX, minY} = canvasParameters;

    const d = 'M ' + minX + ' ' + maxY + ' ' + minX + ' ' + minY;

    const xAxesLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLine.setAttributeNS(null, "d", d);
          xAxesLine.setAttributeNS(null, "fill", "none");
          xAxesLine.setAttributeNS(null, "stroke", '#696969');
          xAxesLine.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLine);

    drawYAxesArrowPoint(minX, minY, svg);
    // drawYTicks(canvasParameters, pointsMeasurementsBundle, svg);
}

function drawYTicks(canvasParameters, pointsMeasurementsBundle, svg){
    const {canvasHeight, canvasWidth, maxX, maxY, minX, minY} = canvasParameters;
    let z = canvasHeight / (pointsMeasurementsBundle[1] - pointsMeasurementsBundle[2]); // приближение
        z = (z == Infinity) ? 1 : z;
    
    
    
}

function drawYAxesArrowPoint(minX, minY, svg){    
    const leftArrowWingPointCoordinates = ' ' + (minX - 3) + ' ' + (minY + 5);
    const rightArrowWingPointCoordinates = ' ' + (minX + 3) + ' ' + (minY + 5);

    const d = 'M ' + minX + ' ' + minY + leftArrowWingPointCoordinates + rightArrowWingPointCoordinates + " Z";

    const xAxesLineArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLineArrow.setAttributeNS(null, "d", d);
          xAxesLineArrow.setAttributeNS(null, "fill", "#696969");
          xAxesLineArrow.setAttributeNS(null, "stroke", '#696969');
          xAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLineArrow);
}

function drawXAxes(canvasParameters, pointsMeasurementsBundle, svg){
    const {maxX, maxY, minX} = canvasParameters;
    
    const d = 'M ' + minX + ' ' + maxY + ' ' + maxX + ' ' + maxY;
    
    const xAxesLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    xAxesLine.setAttributeNS(null, "d", d);
    xAxesLine.setAttributeNS(null, "fill", "none");
    xAxesLine.setAttributeNS(null, "stroke", '#696969');
    xAxesLine.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLine);

    drawXAxesArrowPoint(maxX, maxY, svg);
    drawXTicks(canvasParameters, pointsMeasurementsBundle, svg);
}

function drawXAxesArrowPoint(maxX, maxY, svg){    
    const heigherArrowWingPointCoordinates = ' ' + (maxX - 5) + ' ' + (maxY - 3);
    const lowerArrowWingPointCoordinates = ' ' + (maxX - 5) + ' ' + (maxY + 3);

    const d = 'M ' + maxX + ' ' + maxY + heigherArrowWingPointCoordinates + lowerArrowWingPointCoordinates + " Z";

    const xAxesLineArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLineArrow.setAttributeNS(null, "d", d);
          xAxesLineArrow.setAttributeNS(null, "fill", "#696969");
          xAxesLineArrow.setAttributeNS(null, "stroke", '#696969');
          xAxesLineArrow.setAttributeNS(null, "stroke-width", 1);
          svg.appendChild(xAxesLineArrow);
}

function drawXTicks(canvasParameters, pointsMeasurementsBundle, svg){

    const {canvasWidth, maxY, minX} = canvasParameters;

    let sectionLength = canvasWidth / (pointsMeasurementsBundle[0]); // расстояние между точками
    
    let x = minX + sectionLength / 2;

    let d = 'M';
    for (let index = pointsMeasurementsBundle[0]; index != 0; index--) {
        let y = maxY;
        d += ' ' + x + ' ' + y + ' V';
        y += 3;
        d += ' ' + y + ' M';
        x += sectionLength;
    }

    d = d.slice(0, -2);

    const xAxesLineTicks = document.createElementNS("http://www.w3.org/2000/svg", "path");
          xAxesLineTicks.setAttributeNS(null, "d", d);
          xAxesLineTicks.setAttributeNS(null, "fill", "#696969");
          xAxesLineTicks.setAttributeNS(null, "stroke", '#696969');
          xAxesLineTicks.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(xAxesLineTicks);    
}