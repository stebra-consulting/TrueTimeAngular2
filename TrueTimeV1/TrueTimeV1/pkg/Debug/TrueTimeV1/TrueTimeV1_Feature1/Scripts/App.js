'use strict';

ExecuteOrDelayUntilScriptLoaded(initializePage, "sp.js");

function initializePage()
{
    var context = SP.ClientContext.get_current();
    var user = context.get_web().get_currentUser();

    // This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
    $(document).ready(function () {
        getUserName();
    });

    // This function prepares, loads, and then executes a SharePoint query to get the current users information
    function getUserName() {
        context.load(user);
        context.executeQueryAsync(onGetUserNameSuccess, onGetUserNameFail);
    }

    // This function is executed if the above call is successful
    // It replaces the contents of the 'message' element with the user name
    function onGetUserNameSuccess() {
        $('#message').text('Hello ' + user.get_title());
    }

    // This function is executed if the above call fails
    function onGetUserNameFail(sender, args) {
        alert('Failed to get user name. Error:' + args.get_message());
    }


    function TempMethod() {

        //alert('Loaded');

    }

    function CheckCurrentUserMembership() {

        var clientContext = SP.ClientContext.get_current();

        this.currentUser = clientContext.get_currentUser();

        clientContext.load(this.currentUser);

        this.userGroups = this.currentUser.get_groups();

        clientContext.load(this.userGroups);

        clientContext.executeQueryAsync(OnQuerySucceeded);

    }

    function OnQuerySucceeded() {

        var isMember = false;

        var groupsEnumerator = this.userGroups.getEnumerator();

        while (groupsEnumerator.moveNext()) {

            var group = groupsEnumerator.get_current();

            if (group.get_title() == "TrueTimeAdmin") {

                isMember = true;

                alert('Success');

                break;

            }
            else {
                alert('Fail');

            }

        }

        OnResult(isMember);

    }

    function OnQueryFailed() {

        OnResult(false);

    }

    $(document).ready(function ($) {

        ExecuteOrDelayUntilScriptLoaded(TempMethod, "SP.js");

        SP.SOD.executeFunc('sp.js', 'SP.ClientContext', TempMethod);

        //ExecuteOrDelayUntilScriptLoaded(TempMethod, "SP.ClientContext");

        CheckCurrentUserMembership();

    });
}

  
