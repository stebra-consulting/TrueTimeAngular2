
"use strict";
ExecuteOrDelayUntilScriptLoaded(tidApp, "sp.js");

function tidApp() {



    var context = SP.ClientContext.get_current();
    var user = context.get_web().get_currentUser();
    console.log("user", user);

    context.load(user);
    context.executeQueryAsync(Function.createDelegate(this, onSuccess),
            Function.createDelegate(this, onFail));

    function onSuccess(sender, args) {
        alert('user title:' + user.get_title() + '\n ID:' + user.get_id());
        var userId = user.get_id();
        console.log("ID", userId);
    }
    function onFail(sender, args) {
        alert('failed to get list. Error:' + args.get_message());
    }

}

var hostweburl;   
var appweburl;   

$(document).ready(function () {  
            
    hostweburl =   
        decodeURIComponent(   
            getQueryStringParameter("SPHostUrl"));   
    appweburl =   
        decodeURIComponent(   
            getQueryStringParameter("SPAppWebUrl"));     
    var scriptbase = hostweburl + "/_layouts/15/";    

    $.getScript(scriptbase + "SP.RequestExecutor.js", execCrossDomainRequest);  
});  
              
 

function execCrossDomainRequest() {  
 
    var executor = new SP.RequestExecutor(appweburl);             
    var listName = "Tidsrapport"
 
    executor.executeAsync(  
        {  
                  
            url: appweburl + "/_api/SP.AppContextSite(@target)/web/lists/getbyTitle('Tidsrapport')/Items?$select=Project%2CID%2CCreated&@target='" + hostweburl + "'",
            
            method: "GET",  
            headers: { "Accept": "application/json; odata=verbose" },  
            success: successHandler,
            error: errorHandler
  
        }            
    );
    console.log(listName);
}
function successHandler(data) {
    var jsonObject = JSON.parse(data.body);
    var items = [];
    var results = jsonObject.d.results;
    console.log(results);
    items.push("<ul>");

    $(results).each(function () {

        items.push('<li>' +
                      
                        "<a href=\"" + hostweburl + "/Lists/Tidsrapport/DispForm.aspx?ID=" + this.ID +
                        "\" target=\"_blank\">" + this.Project + "</a>" + "</br>" + "<p>" + this.Created +"</p>" +
                   '</li>');
    });
    console.log(this.Project);
    console.log(this.ID);

    items.push("</ul");
    $("#listResult").html(items.join(''))

    function myFunction() {
        document.getElementById("myDropdown").classList.toggle("show");
    }

}

function errorHandler(data, errorCode, errorMessage) {
    document.getElementById("listResult").innerText = "Could not complete cross-domain call: " + errorMessage;
}

function getQueryStringParameter(paramToRetrieve) {   
    var params =   
        document.URL.split("?")[1].split("&");     
    for (var i = 0; i < params.length; i = i + 1) {   
        var singleParam = params[i].split("=");   
        if (singleParam[0] == paramToRetrieve)   
            return singleParam[1];   
    }   
}
