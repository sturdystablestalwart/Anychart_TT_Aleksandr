// Button listener and transformation section
let timer;
$('#200001').click(function() {
    let self = this;
    handleButtonClick(self);
});
function handleButtonClick(el) {
    let sourceUrl = 'https://gist.githubusercontent.com/sturdystablestalwart/' +
        'c01e34d434af129e6f7e6ddfbf097926/raw/Data_for_the_TT.json';
    let urlFromInput = document.getElementById("100001").value;

    if ( el.value === "Read Json and watch the source" ){
        el.value = "Stop polling";
        if (isValidUrl(urlFromInput)){
            sourceUrl = urlFromInput;
        }
        loadJson(sourceUrl);
        timer = setInterval(loadJson, 5000, sourceUrl);
    }
    else
    {
        el.value = "Read Json and watch the source";
        isActive = false;
        clearInterval(timer);
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
        },
        error: function (error) {
            document.getElementById("000001").innerHTML =
                "Error occurred while trying to load Json from the server " + error
        }
    });
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

