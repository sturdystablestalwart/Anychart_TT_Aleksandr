/**
 * The only global avriable
 */
var timer;

/**
 * Listener set-up for the button that reads the input field and starts to load the Json from a source
 */
const button = document.getElementById("button");
button.addEventListener("click", (event) => {
  handleButtonClick(event);
});

/**
 * Handler for a button press event that reads an input field
 * if there is a valid vlue uses it to periodically load JSON from the sorce provided
 * if there is non uses default value to periodically load JSON
 *
 * Changes button value to reflect current function of a  button
 *
 * @param {object} event
 */
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

/**
 * Loads JSON from a source provided
 *
 * Uses fetch and calls calculatepointsMeasurements and startCharting
 *
 * @param {string} sourceUrl
 */
function loadJson(sourceUrl) {
  fetch(sourceUrl)
    .then((response) => response.json())
    .then((responseJson) => responseJson.data)
    .then((pointsData) => {
      const pointsMeasurementsBundle = calculatepointsMeasurements(pointsData);
      startCharting(pointsMeasurementsBundle, pointsData);
    });
}
/**
 * Calculates amount of points, heighest and lowest of their values
 *
 * @param {object} pointsData
 * @returns {object} {pointsAmount, pointsMaxHeight, pointsMinHeight,};
 */
function calculatepointsMeasurements(pointsData) {
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

/**
 * Checks the validity of URL provided
 *
 * @param {string} string
 * @returns {boolean}
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (error) {
    return false;
  }
}
