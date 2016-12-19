'use strict';

var dupes = {};
var singles = [];


var hostweburl;
var appweburl;
var context;

///Wait for the page to load 
$(document).ready(function () {

    //Get the URI decoded SharePoint site url from the SPHostUrl parameter. 

    hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));


    var spLanguage = decodeURIComponent(getQueryStringParameter('SPLanguage'));

    //Build absolute path 
    var layoutsRoot = hostweburl + '/_layouts/15/';


    //load scripts 

            $.getScript(layoutsRoot + 'SP.js',
                function () {
                    //load scripts for cross site calls (needed to use the people picker control in an IFrame) 
                    $.getScript(layoutsRoot + 'SP.RequestExecutor.js', function () {
                        context = new SP.ClientContext(appweburl);
                        var factory = new SP.ProxyWebRequestExecutorFactory(appweburl);
                        context.set_webRequestExecutorFactory(factory);
                    });

                    //load scripts for calling taxonomy APIs 
                    $.getScript(layoutsRoot + 'init.js',
                        function () {
                            $.getScript(layoutsRoot + 'sp.taxonomy.js',
                                function () {

                                    //TAXONOMY 
                                    GetTaxonomy();

                                });
                        });
                });


});

// 
// 
// 
function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] === paramToRetrieve)
            return singleParam[1];
    }
}

// 
// Get Taxonomy Terms Termsets 
// 
function GetTaxonomy() {

    // Clear all dropdownlist 
    $('#ddlProjets').empty();
    $('#ddlClients').empty();
    dupes = {};
    singles = [];

    // Connection to metadata service 
    var context = SP.ClientContext.get_current();
    var taxonomySession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
    var termStore = taxonomySession.get_termStores().getByName("Taxonomy_AzCU6OxivPbpEZliwX5Mag=="); // set with your own informations 
    var termSet = termStore.getTermSet("768ec8e4-fdff-4b6c-8742-521a73e4d73a"); // set with your own informations 
    var terms = termSet.get_terms();

    context.load(terms);
    context.executeQueryAsync(Function.createDelegate(this, function (sender, args) {

        var termsEnumerator = terms.getEnumerator();
        var menuItems = new Array();

        while (termsEnumerator.moveNext()) {

            var currentTerm = termsEnumerator.get_current();

            var termsChild = currentTerm.get_terms();

            context.load(termsChild);


            var taxoPair = Object.create(null, {
                Parent: {
                    value: currentTerm.get_name(),
                    enumerable: true
                },
                Childs: {
                    value: termsChild,
                    enumerable: true
                }
            });


            //Custom CallBack 
            var myCallBack = Function.createCallback(OnLoadSuccess, taxoPair);

            context.executeQueryAsync(Function.createDelegate(this, myCallBack)),
            Function.createDelegate(this, function (sender, args) {
                alert('The error has occured 1 : ' + args.get_message());
            });


        }
    }), Function.createDelegate(this, function (sender, args) {
        alert('The error has occured 2 : ' + args.get_message());
    }));


}


// 
// 
// 
function OnLoadSuccess(sender, args, taxoPair) {

    // Term's Childs 
    if (taxoPair.Childs.get_count() === 0) {

        // No Childs ! 
        var newItemTree = Object.create(null, {
            Parent: {
                value: taxoPair.Parent,
                enumerable: true
            },
            Child: {
                value: "",
                enumerable: true
            }
        });


        //Populate dropdownlist 
        if (!dupes[newItemTree.Parent]) {
            dupes[newItemTree.Parent] = true;
            singles.push(newItemTree);

            $("#ddlProjets").append($('<option />', {
                value: newItemTree.Parent,
                text: newItemTree.Parent
            }));

        }

    }
    else {

        var termsEnumeratorChild = taxoPair.Childs.getEnumerator();

        while (termsEnumeratorChild.moveNext()) {
            var currentTermChild = termsEnumeratorChild.get_current();

            var newItemTree = Object.create(null, {
                Parent: {
                    value: taxoPair.Parent,
                    enumerable: true
                },
                Child: {
                    value: currentTermChild.get_name(),
                    enumerable: true
                }
            });

            //Populate dropdownlist 
            if (!dupes[newItemTree.Parent]) {
                dupes[newItemTree.Parent] = true;
                singles.push(newItemTree);

                $("#ddlProjets").append($('<option />', {
                    value: newItemTree.Parent,
                    text: newItemTree.Parent
                }));

            }

            $("#ddlClients").append($('<option />', {
                value: newItemTree.Child,
                text: newItemTree.Child
            }));

        }

    }

}