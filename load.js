// Global variables section.
var timer;

const button = document.getElementById("button");
button.addEventListener("click", (event) => {
  handleButtonClick(event);
});

function handleButtonClick(event) {
  var sourceUrl =
    "https://gist.githubusercontent.com/sturdystablestalwart/" +
    "c01e34d434af129e6f7e6ddfbf097926/raw/Data_for_the_TT.json";
  const urlFromInput = document.getElementById("sourceURL").value;

  if (event.target.value === "Read Json and watch the source") {
    if (isValidUrl(urlFromInput)) {
      sourceUrl = urlFromInput;
    }

    loadJson(sourceUrl);
    timer = setInterval(loadJson, 30000, sourceUrl);
    event.target.value = "Stop polling";
  } else {
    clearInterval(timer);
    event.target.value = "Read Json and watch the source";
  }
}

// Loading section.
function loadJson(sourceUrl) {
  fetch(sourceUrl)
    .then((response) => response.json())
    .then((responseJson) => responseJson.data)
    .then((pointsData) => {
      const pointsMeasurementsBundle = calculateзointsMeasurements(pointsData);
      startCharting(pointsMeasurementsBundle, pointsData);
    });
}

function calculateзointsMeasurements(pointsData) {
  const pointsAmount = pointsData.length;
  const pointsMaxHeight = pointsData.reduce((accumulator, currentValue) => {
    if (currentValue.value == undefined) {
      currentValue.value = null;
      return accumulator;
    }
    return accumulator > currentValue.value ? accumulator : currentValue.value;
  }, pointsData[0].value);
  const pointsMinHeight = pointsData.reduce((accumulator, currentValue) => {
    if (currentValue.value == undefined) {
      return accumulator;
    }
    return accumulator < currentValue.value ? accumulator : currentValue.value;
  }, pointsData[0].value);
  const pointsMeasurementsBundle = {
    pointsAmount,
    pointsMaxHeight,
    pointsMinHeight,
  };
  return pointsMeasurementsBundle;
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
