
"use strict";

var globalVarData;
var hostweburl;   
var appweburl;   

$(document).ready(function () {  

    ExecuteOrDelayUntilScriptLoaded(loadRequestExecutor, "sp.js");

    //minTest
    
    var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
    var taxnomiFilePath = scriptbase + "SP.Taxonomy.js";

    console.log(taxnomiFilePath);
    //$.getScript(scriptbase + "SP.Runtime.js",
        
  //  $.getScript(scriptbase + "SP.js", function(){
            
    $.getScript(taxnomiFilePath, execOperation);
            
    });

    // });  


//testar min TermStore

function execOperation() {

    //Current Context
    var context = SP.ClientContext.get_current();

    //Current Taxonomy Session
    var taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);

    //Term Stores
    var termStores = taxSession.get_termStores();

    //Name of the Term Store from which to get the Terms.
    var termStore = termStores.getByName("Taxonomy_Dmxzz8tIBzk8wNVKQpJ+xA==");

    //GUID of Term Set from which to get the Terms.
    var termSet = termStore.getTermSet("b49f64b3-4722-4336-9a5c-56c326b344d4");

    var terms = termSet.getAllTerms();

    context.load(terms);

    context.executeQueryAsync(function () {

        var termEnumerator = terms.getEnumerator();

        var termList = "Terms: \n";

        while (termEnumerator.moveNext()) {

            var currentTerm = termEnumerator.get_current();

            termList += currentTerm.get_name() + "\n";

        }

        alert(termList);

    }, function (sender, args) {

        console.log(args.get_message());

    });

}
function loadRequestExecutor() {

    hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
    var scriptbase = hostweburl + "/_layouts/15/";

    $.getScript(scriptbase + "SP.RequestExecutor.js", getCurrentUserId);
    var scriptbase = _spPageContextInfo.webServerRelativeUrl + "/_layouts/15/";
    var taxnomiFilePath = scriptbase + "SP.Taxonomy.js";

    console.log(taxnomiFilePath);
    //$.getScript(scriptbase + "SP.Runtime.js",

    //  $.getScript(scriptbase + "SP.js", function(){

    $.getScript(taxnomiFilePath, execOperation);
}
 

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
                        "\" target=\"_blank\">" + this.Project.Name + "</a>"  + "</br>" + "<p>" + this.Created +"</p>" +
                   '</li>');
    });
    console.log(this.Project);
    console.log(this.ID);
    console.log(this.Created);

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
function getCurrentUserId(){

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
        execCrossDomainRequestTest(userId);
    }
    function onFail(sender, args) {
        alert('failed to get list. Error:' + args.get_message());
    }

}

function execCrossDomainRequestTest(userId) {
    var listGuid = "99471df6-0ae8-46c8-9fa6-7bfb3e4bfd33";

   
    var url = appweburl + "/_api/SP.AppContextSite(@target)/Web/Lists(guid'" + listGuid + "')/roleassignments/GetByPrincipalId('" + userId + "')/RoleDefinitionBindings?@target='" + hostweburl + "'";

    var pause = "pause";

    var executor = new SP.RequestExecutor(appweburl);
    

    executor.executeAsync(
     {

         url: url,
         
         method: "GET",
         headers: { "Accept": "application/json; odata=verbose" },
         
         success: function (data) {
            
             console.log("success", data);
             globalVarData = data;
             var jsonData = JSON.parse(globalVarData.body)
             console.log(jsonData.d.results["0"].RoleTypeKind);
             var roleTypeKind = jsonData.d.results["0"].RoleTypeKind

             if (roleTypeKind == 5) {
                 $("#admin").append("<h1>Du är Admin</h1>");
                 $("button").click(function(){
                     $("[href]").hide();
                 });
                    
             }

             else {
                 $("#konsult").append("<h1>Du är konsult</h1>");
             }
         },
         error: function (data) { console.log("error", data) }
        
     }

);
    

    console.log(listGuid);
}
  