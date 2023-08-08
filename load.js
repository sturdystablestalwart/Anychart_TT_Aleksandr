// Global variables section.
let timer;

const button = document.getElementById('button');
button.addEventListener('click', (event) =>{
    handleButtonClick(event);
});

function handleButtonClick(event) {
    let sourceUrl = 'https://gist.githubusercontent.com/sturdystablestalwart/' +
        'c01e34d434af129e6f7e6ddfbf097926/raw/Data_for_the_TT.json';
    let urlFromInput = document.getElementById("sourceURL").value;

    if ( event.target.value === "Read Json and watch the source" ){

         if (isValidUrl(urlFromInput)){
            sourceUrl = urlFromInput;
        }

        loadJson(sourceUrl);
        timer = setInterval(loadJson, 30000, sourceUrl);
        event.target.value = "Stop polling";
    }
    else
    {        
        clearInterval(timer);
        event.target.value = "Read Json and watch the source";
    }
}

// Loading section.
function loadJson(sourceUrl) {
    const Http = new XMLHttpRequest();
    Http.open("GET", sourceUrl);
    Http.send();
    Http.addEventListener("error", (error) => {
        document.getElementById("000001").innerHTML =
        "Error occurred while trying to load Json from the server " + error;
    });
    Http.addEventListener("load", ()=>{
        let data = JSON.parse(Http.responseText);
        pointsMeasurementsBundleCalculation(data.data);
    });
}

function pointsMeasurementsBundleCalculation(pointsData) {
    let pointsAmount = pointsData.length;
    let pointsMaxHeight = pointsData.reduce((accumulator, currentValue) => {
        if (currentValue.value == undefined){
            currentValue.value = null;
            return accumulator;
        }
        return (accumulator >  currentValue.value) ? accumulator : currentValue.value;
    }, pointsData[0].value);
    let pointsMinHeight = pointsData.reduce((accumulator, currentValue) => {
        if (currentValue.value == undefined){
            return accumulator;
        }
        return (accumulator <  currentValue.value) ? accumulator : currentValue.value;
    }, pointsData[0].value);
    let pointsMeasurementsBundle = {pointsAmount, pointsMaxHeight, pointsMinHeight};
    startCharting(pointsMeasurementsBundle, pointsData);
}

// Url validator.
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (error) {
        return false;
    }
}