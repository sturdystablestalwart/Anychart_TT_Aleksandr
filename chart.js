
function startCharting(pointsMeasurementsBundle, pointsData,){
    const svg = document.getElementById('linechart');
    // console.log(svg.lastChild,svg.childElementCount);// debug
    if (svg.childElementCount != 0){
        while (svg.hasChildNodes()) {
            svg.removeChild(svg.lastChild);
        }
    }
    findDimentions(pointsMeasurementsBundle, pointsData);
}
function findDimentions(pointsMeasurementsBundle, pointsData){
    const svg = document.getElementById('linechart');
    let svgHeight = svg.getBoundingClientRect().height;
    let svgWidth = svg.getBoundingClientRect().width;
    // console.log(pointsMeasurementsBundle, pointsData);// debug

    let sectionLength = svgWidth / (pointsMeasurementsBundle[0] - 1) * 0.9; // длина отрезка линии графика между точками
    let x = 0.05 * svgWidth;
    let y = 0;    
    let z = svgHeight / pointsMeasurementsBundle[1] - pointsMeasurementsBundle[2]; // расстояние положения зрителя относительно графика 
    z = (z > 1) ? 1 : 1 + z;
    let ySubZeroCompensation = pointsMeasurementsBundle[2] * z;
    let yCentrationShift = pointsMeasurementsBundle[1] * 0.05;
    let d = 'M '
    pointsData.forEach(element => {
        
        y = svgHeight - element.value * z + ySubZeroCompensation - yCentrationShift;
        d += x + ' ' + y + ' ';
        x += sectionLength;
        // console.log(y, svgHeight, x, svgWidth );// debug
    });

    const pathLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathLine.setAttributeNS(null, "d", d);
    pathLine.setAttributeNS(null, "fill", "none");
    pathLine.setAttributeNS(null, "stroke", '#00A69F');
    pathLine.setAttributeNS(null, "stroke-width", 1);
    svg.appendChild(pathLine);
    
    // console.log(y, x, d, z);// debug
}