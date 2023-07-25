//kind of global variables that I didn't knew how to avoid
let timer;

// Button listener and transformation section
$('#200001').click(function() {
    let self = this;
    handleButtonClick(self);
});
function handleButtonClick(el) {
    let sourceUrl = 'https://gist.githubusercontent.com/sturdystablestalwart/' +
        'c01e34d434af129e6f7e6ddfbf097926/raw/Data_for_the_TT.json';
    let urlFromInput = document.getElementById("100001").value;

    if ( el.value === "Read Json and watch the source" ){

         if (isValidUrl(urlFromInput)){
            sourceUrl = urlFromInput;
        }

        loadJson(sourceUrl);
        timer = setInterval(loadJson, 30000, sourceUrl);
        el.value = "Stop polling";
    }
    else
    {        
        clearInterval(timer);
        el.value = "Read Json and watch the source";
    }
}

// Loading section.
function loadJson(sourceUrl)
{
    $.ajax({
        url: sourceUrl,
        dataType: 'json',
        success: function (data) {
            document.getElementById("000001").innerHTML = "The name field is " + data.name;
            pointsLimitationCalculation(data.data);
        },
        error: function (error) {
            document.getElementById("000001").innerHTML =
                "Error occurred while trying to load Json from the server " + error
        }
    });
}

function pointsLimitationCalculation(pointsData){
    let pointsAmount = pointsData.length - 1;// as the last one is an "end"
    let pointsMaxHeight = pointsData.reduce((accumulator, currentValue) => {
        if (currentValue.value == undefined){
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
    console.log(pointsAmount, pointsMaxHeight, pointsMinHeight);//debug
    let pointsMeasurementsBundle = [pointsAmount, pointsMaxHeight, pointsMinHeight];
    startCharting(pointsMeasurementsBundle);
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