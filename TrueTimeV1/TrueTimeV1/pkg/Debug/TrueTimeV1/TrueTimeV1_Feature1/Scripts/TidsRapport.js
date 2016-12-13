(function (global) {
    "use strict";

    var hostweburl;
    var appweburl;

    // Load the required SharePoint libraries
    $(document).ready(function () {
        hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
        appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
        var scriptbase = hostweburl + "/_layouts/15/";
        $.getScript(scriptbase + "SP.RequestExecutor.js", execCrossDomainRequest);

    });

    // Function to prepare and issue the request to get SharePoint data
    function execCrossDomainRequest() {
        var executor = new SP.RequestExecutor(appweburl);

        // Deals with the issue the call against the app web.
        executor.executeAsync({
            url: "https://stebra.sharepoint.com/sites/SD1/_api/Web/Lists(guid'99471df6-0ae8-46c8-9fa6-7bfb3e4bfd33')/roleassignments/GetByPrincipalId()/RoleDefinitionBindings'&$select=ID'",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: successHandler,
            error: errorHandler
        }
        );
    }

    // Function to handle the success event. Prints the data to the page.
    function successHandler(data) {
        var jsonObject = JSON.parse(data.body);
        var items = [];
        var results = jsonObject.d.results;
        items.push("<ul>");

        $(results).each(function () {

            items.push('<li>' + "<a>" +this.ID+"</br>"+ this.RoleTypeKind + "</a>" + '</li>');
        });
        Console.log("data",data);
        items.push("</ul");
        $("#listResult").html(items.join(''))

    }


    // Function to handle the error event. Prints the error message to the page.
    function errorHandler(data, errorCode, errorMessage) {
        document.getElementById("listResult").innerText = "Could not complete cross-domain call: " + errorMessage;
    }

    // Function to retrieve a query string value.
    function getQueryStringParameter(paramToRetrieve) {
        var params =
            document.URL.split("?")[1].split("&");
        var strParams = "";
        for (var i = 0; i < params.length; i = i + 1) {
            var singleParam = params[i].split("=");
            if (singleParam[0] == paramToRetrieve)
                return singleParam[1];
        }
    }
})