/* global $, Dashboard */

// This is the dashing config file that is used to configure the dashboard 
//  original dashing config file is backed up


// It will generate the dashboard based upon what the user has defined if they are already a member
// First time users will have a dummy list generated to give them a quick lesson
//  I'll probably just add a list that has the items as tasks to do to quicly learn the interface

var configuredWidgetIDs = new Array();

// Init the dashboard
var dashboard = new Dashboard();
// alert("Dashboard Loaded");

// containers
var numDashboardWidgets = 0;
// var list_names = new Array();

//var username = document.getElementById("username").value; //fucking magic-- this happens elsewhere....
/* global username*/
populateDashboard(username);


// Initial population of dashboard
// Gets all data for user and prepares all widgets
function populateDashboard(username) {
    // Connect to server and request data for user username
    $.get('widgets/dashboard_helper/', {"keyword":"InitialLoad", "username": username}, function(response){
        // Process server's response
        processResponse(response);
    }); 
}


// Processes server responses
function processResponse(response){
    if(response != null){
        var keyword = response['keyword']
        
        if(keyword == "InitialLoad" || keyword == "ListDetailsEdit"){
            
            var list_ids = response['list_ids'];
            var list_names = response['list_names'];
            var list_items_ids = response['list_items_ids']
            var list_items = response['list_items'];
            var list_items_quantity = response['list_items_quantity'];
            var list_items_details = response['list_items_details'];
            var list_items_checkedStatus = response['list_items_checkedStatus'];
            
            // Process list data
            for(var listIndex = 0; listIndex < list_ids.length; listIndex++){
                var itemsFormatted = new Array();
                //Get list id
                var current_list_id = list_ids[listIndex];
                // Get list name
                var current_list_name = list_names[listIndex];
                
                // Get list items  
                var itemsAdded = 0;
                var collectingItems = false;
                var foundCorrectList = false;
                var current_list_items_ids = new Array();
                var current_list_items = new Array();
                var current_list_items_quantity = new Array();
                var current_list_items_details = new Array();
                var current_list_items_checkedStatus = new Array();
                
                // All details are given as delimited lists 
                for(var itemIndex = 0; itemIndex < list_items.length; itemIndex++){
                    var item_id = list_items_ids[itemIndex];
                    var item = list_items[itemIndex];
                    var item_quantity = list_items_quantity[itemIndex];
                    var item_details = list_items_details[itemIndex];
                    var item_checkedStatus = list_items_checkedStatus[itemIndex];
                    
                    // Handles the items
                    if(foundCorrectList === true){
                        // Stop reading items if delimiter found
                        if(item === "."){
                            collectingItems = false;
                            foundCorrectList = false;
                            break;
                        }
                        // Keep reading in items
                        else{
                            current_list_items_ids.push(item_id);
                            current_list_items.push(item);
                            current_list_items_quantity.push(item_quantity);
                            current_list_items_details.push(item_details);
                            current_list_items_checkedStatus.push(item_checkedStatus);
                            // Keep item count for this list
                            itemsAdded++
                        }
                    }
                    
                    // Handles list ids
                    if(collectingItems === true){
                        // If its the one we want, set boolean and next items are items
                        if(item === current_list_id){
                            foundCorrectList = true;
                        }
                        // Else, we simply skip the items
                    }
                    
                    // Handles delimiter, go to next pos for list_id
                    if(item === "."){
                        collectingItems = true;
                        // alert("Found delimiter");
                    }
                }
    
                // Package list information for widget
                for(var itemFormattingIndex = 0; itemFormattingIndex < current_list_items.length; itemFormattingIndex++){
                    var itemFormatted = {id: current_list_items_ids[itemFormattingIndex],
                                         label: current_list_items[itemFormattingIndex], 
                                         quantity: current_list_items_quantity[itemFormattingIndex],
                                         details: current_list_items_details[itemFormattingIndex],
                                         checkedStatus: current_list_items_checkedStatus[itemFormattingIndex]
                    };
                    
                    itemsFormatted.push(itemFormatted);
                }
                
                // Initial widget loading
                if(keyword == "InitialLoad"){
                    // Add new list widget
                    addLiveList(current_list_id, current_list_name, itemsAdded, itemsFormatted);
                    numDashboardWidgets++;
                }
            }
            
            // List edit
            if(keyword == "ListDetailsEdit"){
                // Get ack
                var ack = response['Ack'];
                if(ack == "Success"){
                    console.log(ack);
                    return itemsFormatted;
                }
                else{
                    console.log("Server could not process response");
                    return
                }
            }
        }
        
        // Settings response processing
        if(keyword == "ListSettingsEdit"){
            
        }
        
        // Sync response processing
        if(keyword == "Sync"){
            
        }
        
        // Add list response processing
        if(keyword == "AddList"){
            
        }
    }
    else{
        console.log("Dashboard was unsuccessful in accessing " + username + "'s information.");
    }
}



// Adds a LiveList Widget instance to the dashboard
function addLiveList(list_id, list_name, num_items, list_items){
    dashboard.addWidget('LiveListWidget' , 'LiveList', {
        row: 2, // TODO - Set these dynamically?
        col: 1,
        interval: 500, // Interval at which sync function will be called (2 mins)
                          // TODO - if we implement local storage of lists only, won't need a sync interval
        initiallyPopulated: false,                  
        updateIntervalSet: false,
        upToDate: true,
        editSaved: true,
        isEditingList: false,
        isEditingSettings: false,
        // Configure the widget's unique attributes based upon list details
        //  This calls configureWidget for every LiveListWidget instance
        configureWidget: function() {
            // Ensure we only add new identifying details to the new list widget
            
            if(this.listId == undefined){
                this.listId = list_id;
                // console.log("Configuring widget " + this.listId);
                this.listName = list_name; 
                this.itemCount = num_items;
                this.items = list_items;
                
                this.itemsAdded = 0;
                this.itemsDeleted = 0;
                this.itemsModified = 0;
                this.isEditingItem = false;
                
                this.deletedItemIndexes = [];
                // alert(this.current_list_id + " - " + this.current_list_name + " will have " + this.itemCount + " items.");
                
                
                
                // Populate the list based on what we have at time of widget creation
                $.extend(this.scope, {
                    title: this.listName,
                    updatedAt: getTimestamp(),  // TODO - This needs to be dynamic, fine at time of adding fresh widget
                    itemsData: this.items
                });  
                
                setInterval(this.sync(), 5000);
            }
        }, 

        // Generates custom html for each dashing generated widget.
        generateHTML: function(){
            if(this.listId != undefined){
                var id = this.listId;
                // If there is a new list and its widget call this function
                if($("#widget").attr("data") == "NOT_CONFIGURED"){
                    if(configuredWidgetIDs.contains(id) === false){
                        var self = this;
                        configuredWidgetIDs.push(id);
                        $("#widget").attr("data", "CONFIGURED");

                        $("#widget").attr("id", "widget" + id); 
                        // For unique views
                        $("#listView").attr("id", "listView" + id);
                        $("#editView").attr("id", "editView" + id);
                        // edit View also requires a hidden element which should be made unique
                        $("#hiddenItem").attr("id", "hiddenItem" + id + "-" + 0);
                        $("#settingsView").attr("id", "settingsView" + id);
            
                        // For unique buttons
                        $("#editButton").attr("id", "editButton" + id);
                        $("#settingsButton").attr("id", "settingsButton" + id);
                        $("#addNewItemButton").attr("id", "addNewItemButton" + id);
                        $("#saveEditButton").attr("id", "saveEditButton" + id);
                        $("#cancelEditButton").attr("id", "cancelEditButton" + id);
                        $("#saveSettingsButton").attr("id", "saveSettingsButton" + id);
                        $("#exitSettingsButton").attr("id", "exitSettingsButton" + id);
                        
                        // For unique items container with locally unique item containers
                        $("#allItemsListView").attr("id", "allItemsListView" + id);
                        $("#allItemsEditView").attr("id", "allItemsEditView" + id);
            
                        // For each item (nth-child function starts at index 1)
                        for(var i = 1; i <= self.itemCount; i++){
                            $("#allItemsListView"+id+" #listItem:nth-child("+i+")").attr("id", "listItem" + i);
                            $("#allItemsEditView"+id+" #editItem:nth-child("+i+")").attr("id", "editItem" + i);
                        }

                        self.initiallyPopulated = true;
                    }
                }
            }
        },
        
        // Occasisonally will ping DB new items
        sync: function(){
            // Only sync non-up-to-date widgets
            if(this.listId != undefined){
                
                if(this.upToDate === false){
                    console.log("Widget " + this.listId + " syncing...");
                }
                
                
                // Push local updates to server, if any
                
                // // Get updates from server, if any
                // if(this.initiallyPopulated === false){
                //     // Add unique HTML
                //     // this.generateHTML(this.listId);
                //     // this.updateWidget(this.listId);
                // }
                // else{
                //     // Update our html
                //     // this.updateWidget(this.listId);
                //     // if(this.updateIntervalSet === false){
                //         // setInterval(this.updateWidget(this.listId), 500);
                //         // this.updateIntervalSet = true;
                //     // }
                // }
                //alert("List " + this.listName + " updated");
                
            }
            
        }, 
        
        // Just a test function
        testFunc: function(id){
            console.log("Testfunction was called");
        },
        
        // Get scope 
        getScope: function(){
            console.log(this.scope);
            return this.scope;
        },
        
        // Set scope items
        setScopeItems: function(items){
            console.log("Setting new items");
            $.extend(this.scope, {itemsData: items});
            console.log(this.scope);
        },
        
        // Handles the button listeners for each view of the widget
        updateWidget: function(){
            // console.log("Widget " + this.listId + " updating...");
            var self = this;
            if(this.listId != undefined){
                var id = this.listId;
                if(self.listId == id){
                    var animateLength = 0;
                    var currentItemsInEditList = self.itemCount;
                    
                    // Listen for button clicks in all views
                    $("#editButton"+id).on("click", function(){
                        if(self.isEditingList === false){
                            // console.log("Open list edit pressed...");
                            $("#listView"+id).hide();
                            $("#editView"+id).show();
                            self.editSaved = false;
                            self.isEditingList = true;
                            return;
                        }
                    });
                    $("#settingsButton"+id).click(function(){
                        if(self.isEditingSettings === false){
                            // console.log("Open settings button pressed...");
                            $("#listView"+id).hide(animateLength);
                            $("#settingsView"+id).show(animateLength);
                            self.isEditingSettings = true;
                        }
                    });
                    
                    // ########################
                    // Edit View Main Buttons
                    // ########################
                    $("#saveEditButton"+id).click(function(){
                        if(self.isEditingList === true){
                            console.log("Sending server new list " + id + " modifications from edit view...");
                            
                            // Get name of list at time of save
                            var modifiedName = $("#editView"+id+" #listName").text();
                            // console.log("Modified name: " + modifiedName);
                            
                            // Get all items currently in the edit view at time of save
                            var modifiedItems = new Array();
                            var itemsString = "";
                            $("#editView"+id+" #label").each(function(){
                                var item = $(this).text();
                                var itemID = $(this).parent().find('.itemID').text();
                                console.log(item);
                                if(modifiedItems.contains(item) === false){
                                    modifiedItems.push(item);
                                    itemsString += itemID +","+ item + "|";
                                    
                                    // console.log(item);
                                }
                                // console.log(itemsString);
                            });
                            // console.log("Items: " + modifiedItems);
                            // console.log(modifiedItems.toString());
                            
                            var newScope = {};
                            // Connect to server with modified data in request
                            $.get('widgets/dashboard_helper/', {"keyword":"ListDetailsEdit", "username": username, "listID": id,"listName": modifiedName, "listItems": itemsString }, function(response){
                                // Process server's response
                                newScope = processResponse(response);
                                // for(var i = 0; i < newScope.length; i++){
                                //     console.log(newScope[i]);
                                // }
                                
                                self.setScopeItems(newScope);
                                // var scope = self.getScope();
                                // console.log("Printing before scope...");
                                // for(var i = 0; i < self.scope.length; i++){
                                //     console.log(self.scope[i]);
                                // }
                                
                                // self.scope = newScope;
                                // if(newScope != null){
                                //     $.extend(self.scope, newScope);
                                // }
                                
                                // console.log("Printing before scope...");
                                // for(var i = 0; i < self.scope.length; i++){
                                //     console.log(self.scope[i]);
                                // }
                            });
                            

                           
                            self.isEditingList = false;
                            
                            // View update
                            $("#editView"+id).hide();
                            $("#listView"+id).show();
                        }
                    });
                    
                    $("#cancelEditButton"+id).click(function(){
                        if (self.isEditingList === true){
                            // console.log("Close edit list pressed");
                            $("#editView"+id).hide();
                            $("#listView"+id).show();
                            // Didn't save it but need to reset this boolean
                            // self.editSaved = true;
                            self.isEditingList = false;
                        }
                    });
                    
                    // Edit View Listeners
                    // Item is clicked in edit view, transform to text entry, don't increment itemsModifed until change accepted
                    $("#editView"+id+" #label").click(function(){
                        if (self.isEditingItem === false){
                            // alert("List " + id + " item clicked...");
                            var currentItem = $(this).text();
                            var currentItemID = $(this).parent().find(".itemID").text();
                            console.log("Item: " + currentItemID + " - " + currentItem);
                            $(this).parent().replaceWith("<div class='input-group'><span class='itemID' style='display:none'>"+currentItemID+"</span><span><input id='newItemLabel' type='text' value='" + currentItem + "'></input></span><span class='input-group-btn'><a id='acceptItemChangeButton' class='btn btn-secondary btn-success' role='button'>OK</a></span></div>");
                            self.isEditingItem = true;
                        }
                    });
                    
                    // Item modification is accepted, increment itemsModified
                    $("#editView"+id+" #acceptItemChangeButton").click(function(){
                        var itemContainerToBeReplaced = $(this).parent().parent();
                        var newItem = itemContainerToBeReplaced.find('#newItemLabel').val();
                        
                        var itemID = itemContainerToBeReplaced.find('.itemID').text();
                        if(!itemID){
                            // Set ID for new items
                            itemID = -1;
                        }
                        itemContainerToBeReplaced.replaceWith("<div class='input-group'><span class='itemID' style='display:none'>"+itemID+"</span><span id='label'>" + newItem  + "</span><span class='input-group-btn'><a id='itemDetails' class='btn btn-secondary btn-primary' role='button'>Details</a></span><span class='input-group-btn'><a id='removeItem' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>");
                        self.isEditingItem=false;
                        return;
                    });
                    
                    // New Item, increment itemsAdded
                    $("#addNewItemButton"+id).click(function(){
                        var newItemContainer = $("#editView"+id+" #hiddenItem"+id+"-"+self.itemsAdded);
                        if (newItemContainer && !self.isEditingItem){
                            // alert("Trying to get #editView"+id+" #hiddenItem"+id+"-"+self.itemsAdded); 
                            self.isEditingItem = true;
                            self.itemsAdded++;
                            var newEditItemId = self.itemCount + self.itemsAdded;
                            newItemContainer.replaceWith("<li id='editItem"+newEditItemId+"'><div class='input-group'><span><input id='newItemLabel' type='text' placeholder='New item' value=''></input></span><span class='input-group-btn'><a id='acceptItemChangeButton' class='btn btn-secondary btn-success' role='button'>OK</a></span></div></li><li id='hiddenItem"+id+"-"+self.itemsAdded+"'><div class='input-group' type='hidden'></div></li>");
                        }
                    });
                    
                    // Removing item
                    $("#editView"+id+" #removeItem").click(function(){
                        // Get the item id from the editItem id
                        var itemToRemoveId = $(this).parent().parent().parent().attr("id").match(/\d+/);
                        // Get the element object to hide. Save or cancel do what is needed after element is no longer visible
                        var itemElementToRemove = $(this).parent().parent().parent();
                        // If we don't already have this index
                        if(itemToRemoveId && !self.deletedItemIndexes.contains(itemToRemoveId)){
                            self.deletedItemIndexes.push(itemToRemoveId);
                            //itemElementToRemove.hide();
                            itemElementToRemove.remove();
                        }
                    });
                    
                    // ############################
                    // Settings View Main Buttons
                    // ############################
                    $("#saveSettingsButton"+id).click(function(){
                        if(self.isEditingSettings === true){
                            // console.log("Save settings button pressed...");
                            $("#settingsView"+id).hide(animateLength);
                            $("#listView"+id).show(animateLength);
                            self.isEditingSettings = false;
                        }
                    });
                    $("#exitSettingsButton"+id).click(function(){
                        if(self.isEditingSettings === true){
                            // console.log("Cancel settings button pressed...");
                            $("#settingsView"+id).hide(animateLength);
                            $("#listView"+id).show(animateLength);
                            self.isEditingSettings = false;
                        }
                    });
                }
            }
        }
    }); // end addWidget
}


// Helpful additions

// Does array contain element? Returns T/F
Array.prototype.contains = function ( needle ) {
   for (var i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}


// Gives a pretty timestamp, thanks internet
function getTimestamp(){
    // Create a date object with the current time
    var now = new Date();
    // Create an array with the current month, day and time
    var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
    // Create an array with the current hour, minute and second
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
    // Determine AM or PM suffix based on the hour
    var suffix = ( time[0] < 12 ) ? "AM" : "PM";
    // Convert hour from military time
    time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
    // If hour is 0, set it to 12
    time[0] = time[0] || 12;
    // If seconds and minutes are less than 10, add a zero
    for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
          time[i] = "0" + time[i];
        }
    }
    // Return the formatted string
    return date.join("/") + " " + time.join(":") + " " + suffix;
}




// addWidget method adds the widget to the dashboard
// dashboard.addWidget('LiveListWidget', 'LiveList', {
//     getData: function () {
//         var thisWidget = this.scope;
//         $.get('widgets/live_list_widget/', function(response){
//             // for (x in response['data']){
//             //     alert(response['data'][x]);
//             //     $.extend(this.scope, {
//             //         data: {label: response['data'][x]}
//             //     });
//             // }
//             var itemsData = response['itemsData'];
//             //alert(itemsData);
//             var items = new Array();
//             for (var x in itemsData){
//                 var item = {label: itemsData[x], value: ''};
//                 items.push(item);
//                 //alert(item['label']);
//             }
//             //alert(items);
//             $.extend(thisWidget, {
//                 title: response['title'],
//                 //moreInfo: response['moreInfo'],
//                 updatedAt: response['updatedAt'],
//                 itemsData: items
//             }); 
//         });
//         // this.changeSize(2,2);
//     }, interval: 900000 // Refresh every 1.5 min 

// });



    // #################
    // Add New List 
    // #################
    
    var max_fields        = 15; //maximum input boxes allowed
    var wrapper           = $("#itemInputWrapper"); //Fields wrapper
    var saveWrapper       = $(".addListButtonWrapper")
    var add_button        = $("#addItemButton"); // Add button ID
    var add_list          = $("#addListButton"); // Save List
    var newListItems      = 1; // Number of items in new list at time of creation
    var newListItemsIndex = 1; // Keeps the indexing for object different than the items that will be added
    var newItemsContainer = $("#itemInputWrapper"); // Array of item input objects
    
    
    $(add_button).click(function(e){ //on add input button click
        e.preventDefault();
        if(newListItems < max_fields){ //max input box allowed
            newListItems++; //text box increment
            newListItemsIndex++; 
            $(wrapper).append("<div id='item"+newListItemsIndex+"' class='input-group'><input type='text' class='form-control'></input><span class='input-group-btn'><a id='removeItem' href='#' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>"); //add input box
            //$(wrapper).append('<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
        }
    });
    
    
    
    $(wrapper).on("click","#removeItem", function(e){ //user click on remove text
        e.preventDefault(); $(this).parent('span').parent('div').remove(); 
        newListItems--;
        // Notice we don't decrement newListItemsIndex
        // We keep that iterating forever for item div indexing
    });
    
    
    $(add_list).click(function(){
        // console.log("Adding new list, there were " + numDashboardWidgets + " lists. Adding another...")
        numDashboardWidgets++;
        var newListId = numDashboardWidgets;
        var newListName = username + "'s New List";
        var newItems = new Array();
        for(var i = 1; i <= newListItems; i++){
            //console.log(newItemsContainer.find("#item"+i+" input").val());
            // Add the new items to an array
            var item = {label: newItemsContainer.find("#item"+i+" input").val(), value: ''};
            newItems.push(item);
            // console.log(newItems[i-1]);
        }
        
        // Add new list widget
        addLiveList(newListId, newListName, newListItems, newItems);
        
    });
    
    // There needs to be some work with cookies or database calls to ensure all widgets that need to be shown, are
    // $(saveWrapper).on("click","#addList", function(e){ //user click on save, add new widget to dashboard
        //alert(items);
        // dashboard.addWidget('LiveListWidget', 'LiveList', {
        //     getData: function () {
        //         var thisWidget = this.scope;
        //         $.get('widgets/live_list_widget/', function(response){
        //             // for (x in response['data']){
        //             //     alert(response['data'][x]);
        //             //     $.extend(this.scope, {
        //             //         data: {label: response['data'][x]}
        //             //     });
        //             // }
        //             var itemsData = response['itemsData'];
        //             //alert(itemsData);
        //             var items = new Array();
        //             for (var x in itemsData){
        //                 var item = {label: itemsData[x], value: ''};
        //                 items.push(item);
        //                 //alert(item['label']);
        //             }
        //             //alert(items);
        //             $.extend(thisWidget, {
        //                 title: response['title'],
        //                 //moreInfo: response['moreInfo'],
        //                 updatedAt: response['updatedAt'],
        //                 itemsData: items
        //             }); 
        //         });
        //         // this.changeSize(2,2);
        //     }, interval: 900000 // Refresh every 1.5 min 

        // });
    // });








// ************
// Reference
// ************

// This allows for multiple dashboards
// Could be useful later (maybe list type each get own dashboard? This could get complicated)

    // var dashSet = new DashboardSet();
    // var one = new Dashboard();
    // var two = new Dashboard();
    // myDashboardSet.addDashboard(one);
    // myDashboardSet.addDashboard(two);


// This will add an action to the overlay menu that is triggered on press of ctrl
//  I belive that I have this disabled via the base.html file where the overlay is defined

    // myDashboardSet.addAction('Go to Google', function() {
    //     window.location.href = 'https://google.com/';
    // })
    
    
    
// This is used for reference
// getData: defined here as an extension to what is defined in the widget specific js files 
//              in the dashing static dir
//          automatically called every 
// dashboard.addWidget('RealTimeListWidget' , 'LiveList', {
//     getData: function () {
//         $.extend(this.scope, {
//             title: 'Grocereasier',
//             moreInfo: '',
//             updatedAt: 'List is up-to-date!',
//             itemsData: [{label: 'Apples', id: '0'},
//                         {label: 'Bananas', id: '1'},
//                         {label: 'Chicken', id: ''},
//                         {label: 'Dill Pickles', id: ''},
//                         {label: 'Apples', id: ''},
//                         {label: 'Bananas', id: ''},
//                         {label: 'Chicken', id: ''},
//                         {label: 'Apples', id: ''},
//                         {label: 'Bananas', id: ''},
//                         {label: 'Chicken', id: ''},
//                         {label: 'Apples', id: ''},
//                         {label: 'Bananas', id: ''},
//                         {label: 'Chicken', id: ''},
//                         {label: 'Apples', id: ''},
//                         {label: 'Bananas', id: ''},
//                         {label: 'Chicken', id: ''}]
//             }); 
//     }
// });