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

var username = "Test";
populateDashboard(username);


// Ajax works fine with get, but not post
//  If security is ever an issue, this is where to start
// testAjax();

// Testing ability to use POST
// function testAjax(){
//     $.ajax({
//          type:"GET", // POST won't work
//          url:"widgets/dashboard_helper/",
//          data: { 'username':username },
//          success: function(response){
//              alert("Successful POST!"); 
//          },
//          error: function(){
//              alert("AJAX failed...");
//          }
//     });
// }


// Initial population of dashboard
// Gets all data for user and prepares all widgets
function populateDashboard(username) {
    // Connect to server and request data for user username
    $.get('widgets/dashboard_helper/', {"keyword":"InitialLoad", "username": username}, function(response){
        // Process server's response
        processUserData(response);
    }); 
}


// Processes server response for initial population
function processUserData(response){
    if(response != null){

        var list_ids = response['list_ids'];
        var list_names = response['list_names'];
        var list_items = response['list_items'];
        var list_items_quantity = response['list_items_quantity'];
        var list_items_details = response['list_items_details'];
        var list_items_checkedStatus = response['list_items_checkedStatus'];
        // alert("List ID's: " + response['list_ids'] + "\nList names: " + response['list_names'] + "\nList items: " + response['list_items']);

        
        // Add lists to dashbaord as widgets
        for(var listIndex = 0; listIndex < list_ids.length; listIndex++){
            //Get list id
            var current_list_id = list_ids[listIndex];
            // Get list name
            var current_list_name = list_names[listIndex];
            
            
            // Get list items  
            var itemsAdded = 0;
            var collectingItems = false;
            var foundCorrectList = false;
            var current_list_items = new Array();
            var current_list_items_quantity = new Array();
            var current_list_items_details = new Array();
            var current_list_items_checkedStatus = new Array();
            
            
            // All details are given as delimited lists 
            for(var itemIndex = 0; itemIndex < list_items.length; itemIndex++){    
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
                        // alert("Finished list " + current_list_id);
                        break;
                    }
                    // Keep reading in items
                    else{
                        current_list_items.push(item);
                        current_list_items_quantity.push(item_quantity);
                        current_list_items_details.push(item_details);
                        current_list_items_checkedStatus.push(item_checkedStatus);
                        
                        // Keep item count for this list
                        itemsAdded++
                        // alert("Found item");
                    }
                }
                
                
                // Handles list ids
                if(collectingItems === true){
                    // If its the one we want, set boolean and next items are items
                    if(item === current_list_id){
                        foundCorrectList = true;
                        // alert("Found list " + current_list_id);
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
            var itemsFormatted = new Array();

            for(var itemFormattingIndex = 0; itemFormattingIndex < current_list_items.length; itemFormattingIndex++){
                var itemFormatted = {label: current_list_items[itemFormattingIndex], 
                                     quantity: current_list_items_quantity[itemFormattingIndex],
                                     details: current_list_items_details[itemFormattingIndex],
                                     checkedStatus: current_list_items_checkedStatus[itemFormattingIndex]
                };
                
                itemsFormatted.push(itemFormatted);
            }
            
            // Add new list widget
            addLiveList(current_list_id, current_list_name, itemsAdded, itemsFormatted);
            numDashboardWidgets++;
        
            
        } // end lists for loop    
    }
    else{
        alert("Dashboard was unsuccessful in accessing " + username + "'s information.")
    }
}




// Adds a LiveList Widget instance to the dashboard
function addLiveList(list_id, list_name, num_items, list_items){
    // console.log("Adding widget: " + list_id + " - " + list_name + "\n" + "Item count: " + num_items + "\n");
    // console.log("Items:\n");
    // for(var i = 0; i < num_items; i++){
    //     console.log(list_items[i]);
    // }
    dashboard.addWidget('LiveListWidget' , 'LiveList', {
        row: 2, // TODO - Set these dynamically?
        col: 1,
        interval: 500, // Interval at which sync function will be called (2 mins)
                          // TODO - if we implement local storage of lists only, won't need a sync interval
                          
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
                
                
            // Generate custom html with unique tags and add to dashboard
            
            // setTimeout(this.generateHTML(this.listId), 3000);
            
            
            
            } // end if listID == null
            

            
        }, // end configureWidget
        
        // Fuck im tired but i just hit my milestone
        // TODO - This method needs to be called by update widget in order to run
        //  at the right time (run it before and there isn't anything to change).
        //  Upon the first call of the sync command, we will run through the generated 
        //  html, by dashing, and replace each widget with unique tags so that we may 
        //  edit without concern for editing more than one list
        // TODO - go through this set up the html file accoringly to make few and small 
        // replacements. i.e. dont change text as below, just the id 
        generateHTML: function(id){

            // If there is a new list and its widget call this function
            if($("#widget").attr("data") == "NOT_CONFIGURED"){
                if(configuredWidgetIDs.contains(id) === false){
                    var self = this;
                    configuredWidgetIDs.push(id);
                    // console.log("Widget " + this.listId + " html generated...");
                    $("#widget").attr("data", "CONFIGURED");
                    
                    // Add this widget to the             
                    //$("#listView").replaceWith(listViewHTML);
                    
                    //$("#settingsButton" ).replaceWith("<ul id='settingsButton"+id+"'><span><a type='button' class='btn btn-block btn-primary'>Settings"+id+"</a></span></ul>");
        
                    // Trying to replace the Widget container ID in order to uniquely id it
                    //  Not sure if this one change will be enough, I'm thinking addressing any element
                    //  with reference to the parent widget+id will be good enough to find correct element
                    $("#widget").attr("id", "widget" + id); // Fucking works, sick
                    //console.log("Generating new ")
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
                }
            }
        },
        sync: function(){
            // Only sync non-new widgets
            if(this.listId != undefined){
                // console.log("Widget " + this.listId + " syncing...");
                // Push local updates to server, if any
                
                // Get updates from server, if any
                
                this.generateHTML(this.listId);
                
                // Update our html
                this.updateWidget(this.listId);
                //alert("List " + this.listName + " updated");
                
            }
            
        }, // end sync
        testFunc: function(id){
            console.log("Testfunction was called");
        },
        updateWidget: function(id){
            var self = this;
            if(self.listId == id){
                var animateLength = 0;
                var currentItemsInEditList = self.itemCount;
                
                // Listen for button clicks in all views
                $("#editButton"+id).click(function(){
                    // alert("editButton pressed...")
                    $("#listView"+id).hide();
                    $("#editView"+id).show();
                });
                $("#settingsButton"+id).click(function(){
                    // alert("settingsButton pressed...")
                    $("#listView"+id).hide(animateLength);
                    $("#settingsView"+id).show(animateLength);
                });
                
                // ########################
                // Edit View Main Buttons
                // ########################
                $("#saveEditButton"+id).click(function(){
                    // Get name of list at time of save
                    var modifiedName = $("#editView"+id+" #listName").text();
                    
                    // Get all items currently in the edit view at time of save
                    var modifiedItems = new Array();
                    $("#editView"+id+" #label").each(function(){
                        var item = $(this).text();
                        if(modifiedItems.contains(item) === false){
                            modifiedItems.push(item);
                            console.log(item);
                        }
                    });
                    
                    // console.log(modifiedName);
                    
                    // View update
                    $("#editView"+id).hide();
                    $("#listView"+id).show();
                });
                
                $("#cancelEditButton"+id).click(function(){
                    // alert("settingsButton pressed...")
                    $("#editView"+id).hide();
                    $("#listView"+id).show();
                });
                
                // Edit View Listeners
                // Item is clicked in edit view, transform to text entry, don't increment itemsModifed until change accepted
                $("#editView"+id+" #label").click(function(){
                    if (!self.isEditingItem){
                        // alert("List " + id + " item clicked...");
                        var currentItem = $(this).text();
                        $(this).parent().replaceWith("<div class='input-group'><span><input id='newItemLabel' type='text' value='" + currentItem + "'></input></span><span class='input-group-btn'><a id='acceptItemChangeButton' class='btn btn-secondary btn-success' role='button'>OK</a></span></div>");
                        self.isEditingItem = true;
                    }
                });
                
                // Item modification is accepted, increment itemsModified
                $("#editView"+id+" #acceptItemChangeButton").click(function(){
                    var itemContainerToBeReplaced = $(this).parent().parent();
                    var newItem = itemContainerToBeReplaced.find('#newItemLabel').val();
                    itemContainerToBeReplaced.replaceWith("<div class='input-group'><span id='label'>" + newItem  + "</span><span class='input-group-btn'><a id='itemDetails' class='btn btn-secondary btn-primary' role='button'>Details</a></span><span class='input-group-btn'><a id='removeItem' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>");
                    self.isEditingItem=false;
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
                    // alert("editButton pressed...")
                    $("#settingsView"+id).hide(animateLength);
                    $("#listView"+id).show(animateLength);
                });
                $("#exitSettingsButton"+id).click(function(){
                    // alert("settingsButton pressed...")
                    $("#settingsView"+id).hide(animateLength);
                    $("#listView"+id).show(animateLength);
                });
            }
        }
    }); // end addWidget
}


// Helpful additions

/**
 * Array.prototype.[method name] allows you to define/overwrite an objects method
 * needle is the item you are searching for
 * this is a special variable that refers to "this" instance of an Array.
 * returns true if needle is in the array, and false otherwise
 */
Array.prototype.contains = function ( needle ) {
   for (var i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}



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
        var newListName = "New List 1";
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