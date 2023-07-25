
function startCharting(pointsMeasurementsBundle){
    findDimentions(pointsMeasurementsBundle);
}
function findDimentions(pointsMeasurementsBundle){
    const svg = document.getElementById('linechart');
    let svgHeight = svg.getBoundingClientRect().height;
    let svgWidth = svg.getBoundingClientRect().width;
    console.log(pointsMeasurementsBundle);// debug

    let canavasHeight = svgHeight * 0.8;
    let canavasWidth = svgWidth * 0.8;

}