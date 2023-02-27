// Button listener and transformation section.
$('#200001').click(function() {
    let self = this;
    handleButtonClick(self);
});
function handleButtonClick( el ) {
    let sourceUrl = 'https://gist.githubusercontent.com/sturdystablestalwart/' +
        'c01e34d434af129e6f7e6ddfbf097926/raw/Data_for_the_TT.json'
    let urlFromInput = document.getElementById("100001").value
    let isActive = true
    if (isValidUrl(urlFromInput)){sourceUrl = urlFromInput}

    if ( el.value === "Read Json and watch the source" ){
        el.value = "Stop polling"
        if (isValidUrl(urlFromInput)){
            sourceUrl = urlFromInput;
        }
        loadJson(isActive, sourceUrl);
    }
    else
        el.value = "Read Json and watch the source";
        isActive = false;
        loadJson(isActive, sourceUrl);
}

// Loading section.
function loadJson(isActive, sourceUrl)
{
    if (isActive)
    {
        window.setTimeout(function () {
            $.ajax({
                url: sourceUrl,
                dataType: 'json',
                success: function (data) {
                    document.getElementById("000001").innerHTML = "The name field is " + data.name;
                    loadJson(isActive, sourceUrl);
                },
                error: function (error) {
                    document.getElementById("000001").innerHTML =
                        "Error occurred while trying to load Json from the server " + error
                    loadJson(isActive, sourceUrl);
                }});
        }, 30000);
    }
}
//TODO create a solution for initial timeout
//TODO create a solution for stopping the polling

// Url validator.
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (error) {
        return false;
    }
}

