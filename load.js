// Button listener and transformation section.
$('#200001').click(function() {
    let self = this;
    changeButton(self);
});
function changeButton( el ) {
    let sourceUrl = 'https://gist.githubusercontent.com/sturdystablestalwart/' +
        'c01e34d434af129e6f7e6ddfbf097926/raw/Data_for_the_TT.json'
    let urlFromInput = document.getElementById("100001").value
    if (isValidUrl(urlFromInput)){sourceUrl = urlFromInput}
    if ( el.value === "Read Json and watch the source" ){
        el.value = "Stop polling"
        if (isValidUrl(urlFromInput)){
            sourceUrl = urlFromInput
        }
        loadJson(sourceUrl);
        pollServer(true, sourceUrl);
    }
    else
        el.value = "Read Json and watch the source";
        pollServer(false, sourceUrl);
}

// Loading section.
function loadJson(sourceUrl) {
    $.ajax({
        url: sourceUrl,
        dataType: 'json',
        success: function(data) {
            document.getElementById("000001").innerHTML = "The name field is " + data.name;
            },
        error: function(error) {
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
    } catch (err) {
        return false;
    }
}

//TODO https://learn.javascript.ru/long-polling
function pollServer(isActive, sourceUrl)
{
    if (isActive)
    {
        window.setTimeout(function () {
            $.ajax({
                url: sourceUrl,
                dataType: 'json',
                success: function (data) {
                    document.getElementById("000001").innerHTML = "The name field is " + data.name;
                    pollServer();
                },
                error: function (error) {
                    document.getElementById("000001").innerHTML =
                        "Error occurred while trying to load Json from the server " + error
                    pollServer();
                }});
        }, 30000);
    }
}
