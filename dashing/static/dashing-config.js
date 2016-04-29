/* global $, username, userid, Dashboard */

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


// For list tags
var possibleTags = new Array();
possibleTags.push("Healthy");
possibleTags.push("Unhealthy");
possibleTags.push("Cheap");
possibleTags.push("Expensive");
possibleTags.push("Meal");

var globalFlag = false;


// Username is set from the request to dashing/base.html
populateDashboard(username, userid);


// Initial population of dashboard
// Gets all data for user and prepares all widgets
function populateDashboard(username, userid) {
    // Connect to server and request data for user username
    $.get('widgets/dashboard_helper/', {"keyword":"InitialLoad", "username": username, "userid": userid}, function(response){
        // Process server's response
        processResponse(null, response);
    }); 
}


// Processes server responses
function processResponse(widget, response){
    if(response != null){
        console.log("Request received");

        var keyword = response['keyword'];
        var ack = response['Ack'];
        
        // Do not process failed requests
        if(ack == "Fail"){
            
            // If sync receives a failure ack
            if(keyword == "Sync"){
                widget.isSyncing = false;
                console.log("Sync command did not require update");
            }
            
            // Typical case
            else{
                console.log("Server " + keyword + " attempt failed...");
            }
            
            return;
        }
        
        // Process list details
        if(keyword == "InitialLoad" || keyword == "ListDetailsEdit" || keyword == "AddListRequest" || keyword == "Sync"){

            var list_ids = response['list_ids'];
            var list_names = response['list_names'];
            var list_items_ids = response['list_items_ids'];
            var list_items = response['list_items'];
            var list_items_quantity = response['list_items_quantity'];
            var list_items_details = response['list_items_details'];
            var list_items_checkedStatus = response['list_items_checkedStatus'];
 
            // // If first load, init the widget global tag and user contianers           
            // if(keyword == "InitialLoad"){
            //     widget_listTags =  new Array(list_ids.length);
            // }
            
            
            // Process list data
            // console.log(list_ids.length);
            for(var listIndex = 0; listIndex < list_ids.length; listIndex++){
                var itemsFormatted = new Array();
                // Get list id
                // console.log(list_ids[listIndex]);
                var current_list_id = list_ids[listIndex];
                // Get list name
                // console.log(list_names[listIndex]);
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
                            // console.log(item);
                            current_list_items_ids.push(item_id);
                            current_list_items.push(item);
                            current_list_items_quantity.push(item_quantity);
                            current_list_items_details.push(item_details);
                            current_list_items_checkedStatus.push(item_checkedStatus);
                            // Keep item count for this list
                            itemsAdded++;
                        }
                    }
                    
                    // Handles list ids
                    if(collectingItems === true){
                        // If its the one we want, set boolean and next items are items
                        if(item == current_list_id){
                            foundCorrectList = true;
                        }
                        // Else, we simply skip the items
                    }
                    else{
                        // Handles delimiter, go to next pos for list_id
                        if(item === "."){
                            collectingItems = true;
                            // alert("Found delimiter");
                        }
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
                
                
                // Handle the list details accordingly
                
                // Initial widget loading
                if(keyword == "InitialLoad"){
                    var list_users = extractUsers(response, listIndex);
                    var list_tags = extractTags(response, listIndex);
                    
                    // Add new list widget
                    addLiveList(current_list_id, current_list_name, itemsAdded, itemsFormatted, list_users, list_tags);
                    numDashboardWidgets++;
                }
                
                // List edit
                if(keyword == "ListDetailsEdit"){
                    widget.list_id = current_list_id;
                    widget.itemCount = itemsAdded;
                    return [current_list_name, getTimestamp(), itemsFormatted];
                }
                
                // Add list
                if(keyword == "AddListRequest"){
                    var list_id = response['list_ids'];
                    var list_name = response['list_names'];
                    
                    // Adding a list doesn't specify settings, they must be set initially and 
                    //   then manually by user in settings view
                    addLiveList(list_id, list_name, itemsAdded, itemsFormatted, null, null);
                    return;
                }
                
                // Sync response processing
                //  If we are here, then db must have sent info so update the widget
                if(keyword == "Sync"){
                    widget.list_id = current_list_id;
                    widget.isSyncing = false;
                    return [current_list_name, getTimestamp(), itemsFormatted];
                }
            }
        }
        
        
        // Settings response processing
        if(keyword == "ListSettingsEdit" ){ 
        
            // TODO
            //  This works without throwing errors but needs further testing. Once users and tags are final
        
            var list_ids = response['list_ids'];
            widget.listId = list_ids;

            for(var listIndex = 0; listIndex < list_ids.length; listIndex++){
                
                widget.list_users = extractUsers(response, listIndex);
                
                widget.list_tags = extractTags(response, listIndex);
                
            }
        }
        
        
        // Sync response processing (List details and settings)
        if(keyword == "Sync"){
            
        }
        
    }
    else{
        // alert("Welcome to your dashboard. Add a list to get started!");
        console.log("Server could not process response");
    }
}


// Extracts users from resonse as array
function extractUsers(response, listIndex){
    var list_ids = response['list_ids'];
    var list_users = response['list_users'];

    // Process list data
    // console.log(list_ids.length);

    // Get list id
    // console.log(list_ids[listIndex]);
    var current_list_id = list_ids[listIndex];
    
    var current_list_users = new Array();

    // Get list users
    var usersAdded = 0;
    var collectingUsers = false;
    var foundCorrectList = false;
    
    
    // All details are given as delimited lists 
    for(var userIndex = 0; userIndex < list_users.length; userIndex++){
        var user = list_users[userIndex];

        // Handles the users
        if(foundCorrectList === true){
            // Stop reading users if delimiter found
            if(user === "."){
                collectingUsers = false;
                foundCorrectList = false;
                break;
            }
            // Keep reading in users
            else{
                // console.log(user);
                
                current_list_users.push(user);
                
                // Keep user count for this list
                usersAdded++;
            }
        }
        
        // Handles list ids
        if(collectingUsers === true){
            // If its the one we want, set boolean and next users are users
            if(user == current_list_id){
                foundCorrectList = true;
            }
            // Else, we simply skip the users
        }
        else{
            // Handles delimiter, go to next pos for list_id
            if(user === "."){
                collectingUsers = true;
                // alert("Found delimiter");
            }
        }
    }

    return current_list_users;
}

// Extracts users from resonse as array
function extractTags(response, listIndex){
    var list_ids = response['list_ids'];
    var list_tags = response['list_tags'];

    // Process list data
    // console.log(list_ids.length);

    // Get list id
    // console.log(list_ids[listIndex]);
    var current_list_id = list_ids[listIndex];
    
    var current_list_tags = new Array();

    // Get list tags
    var tagsAdded = 0;
    var collectingUsers = false;
    var foundCorrectList = false;
    
    
    // All details are given as delimited lists 
    for(var tagIndex = 0; tagIndex < list_tags.length; tagIndex++){
        var tag = list_tags[tagIndex];

        // Handles the tags
        if(foundCorrectList === true){
            // Stop reading tags if delimiter found
            if(tag === "."){
                collectingUsers = false;
                foundCorrectList = false;
                break;
            }
            // Keep reading in tags
            else{
                // console.log(tag);
                
                current_list_tags.push(tag);
                
                // Keep tag count for this list
                tagsAdded++;
            }
        }
        
        // Handles list ids
        if(collectingUsers === true){
            // If its the one we want, set boolean and next tags are tags
            if(tag == current_list_id){
                foundCorrectList = true;
            }
            // Else, we simply skip the tags
        }
        else{
            // Handles delimiter, go to next pos for list_id
            if(tag === "."){
                collectingUsers = true;
                // alert("Found delimiter");
            }
        }
    }

    return current_list_tags;
}


// Adds a LiveList Widget instance to the dashboard
function addLiveList(list_id, list_name, num_items, list_items, list_users, list_tags){
    
    var numRows = 1;
    if(num_items < 5){
        numRows = 1;
    }
    else {
        if(num_items < 12)
            numRows = 2;
        else {
            if(num_items < 20)
                numRows = 3;
            else{
                if(num_items < 28)
                    numRows = 4;
                
            }
        }
    }

    dashboard.addWidget('LiveListWidget' , 'LiveList', {
        row: numRows,
        col: 1,
        interval: 500, // Interval at which sync function will be called (2 mins)
                          // TODO - if we implement local storage of lists only, won't need a sync interval
        initiallyPopulated: false,                  
        updateIntervalSet: false,
        upToDate: false,
        // editSaved: true,
        isEditingList: false,
        isEditingSettings: false,
        // awaitingAddList: isPseudoAddList,
        isEditingTitle: false,
        isRemovingItem: false,
        isSyncing: false,
        isOutOfDate: true,
        isInitialized: false,
        
        isEditingTags: false,
        isEditingUsers: false,
        
        leaveList: false,

        // Configure the widget's unique attributes based upon list details
        //  This calls configureWidget for every LiveListWidget instance
        configureWidget: function() {
            // Ensure we only add new identifying details to the new list widget
            
            if(this.listId == undefined){
                if(this.isInitialized === false){
                    
                    this.isInitialized = false;

                    this.listWidgetIndex = numDashboardWidgets;
                    this.listId = list_id;
                    // console.log("Configuring widget " + this.listId);
                    this.listName = list_name; 
                    this.itemCount = num_items;
    
                    this.itemsAdded = 0;
                    this.itemsDeleted = 0;
                    this.itemsModified = 0;
                    this.isEditingItem = false;
                    
                
                    // if(this.itemCount < 5){
                    //     this.row=1;
                    //     this.col=1;
                    // }
                    // else{
                    //     this.row=;
                    //     this.col=1;
                    // }
                
                    
                    // Holds the basic item info for the list (ID and label)
                    //  Format: 
                    //      { item { id, label, quantity, details, checkedStatus}, item2 {...}, ...
                    this.items = list_items;
                    
                    // These are local storage and can all be associated with eachother via index
                    // IDs
                    this.items_ids = [];
                    // Labels
                    this.items_labels = [];
                    // Quantity
                    this.items_quantity = [];
                    // Details
                    this.items_details = [];
                    // CheckedStatus
                    this.items_checkedStatus = [];
                    
                    // TODO
                    //  This hasnt been tested thoroughly yet
                    if(list_users)
                        this.list_users = list_users;
                    else
                        this.list_users = [];
                    
                    if(list_tags)
                        this.list_tags = list_tags;
                    else
                        this.list_tags = [];
                            
                    
                    // console.log(this.items);
                            
                    // Populate local storage
                    for(var i = 0; i < this.itemCount; i++){
                        if (this.items[i]){
                            
                            // console.log(this.items[i]);
    
                            this.items_ids.push(this.items[i].id);
                            this.items_labels.push(this.items[i].label);
                            this.items_quantity.push(this.items[i].quantity);
                            this.items_details.push(this.items[i].details);
                            this.items_checkedStatus.push(this.items[i].checkedStatus);
                        }
                    }
                    
                    
                    // Print local storage
                    // console.log(this.items_ids);
                    // console.log(this.items_labels);
                    // console.log(this.items_quantity);
                    // console.log(this.items_details);
                    // console.log(this.items_checkedStatus);
                    
                    
                    // Holds the item labels at the time of save 
                    this.itemsString = "";
                    
                    // Items that get modified during list edit 
                    this.modifiedItemIndexes = [];
                    this.modifiedItemIndexesString = "";
                    
                    // Items that get deleted during list edit 
                    this.deletedItemIndexes = [];
                    this.deletedItemIndexesString = "";
                    
                    // Users and tags temp containers
                    // this.allSetTags = [];
                    // this.allUsers = [];
                    
                    
                    // // Holds the users shared with at the time of save 
                    // this.usersString = "";
                    
                    // // Users that get added during list settings 
                    // this.addedUserIndexes = [];
                    // this.addedUserIndexesString = "";
                    
                    // // Users that get deleted during list settings 
                    // this.deletedUserIndexes = [];
                    // this.deletedUserIndexesString = "";
                    
                    // // Holds the tags shared with at the time of save 
                    // this.tagsString = "";
                    
                    // // Tags that get added during list settings 
                    // this.addedTagIndexes = [];
                    // this.addedTagIndexesString = "";
                    
                    // // Tags that get deleted during list settings 
                    // this.deletedTagIndexes = [];
                    // this.deletedTagIndexesString = "";
                    
                    
                    // Timestamp of last sync
                    this.lastSyncTimestamp = getTimestamp();
                    
                    // alert(this.current_list_id + " - " + this.current_list_name + " will have " + this.itemCount + " items.");
                    
                    // Populate the list based on what we have at time of widget creation
                    $.extend(this.scope, {
                        title: this.listName,
                        updatedAt: getTimestamp(),  // TODO - This needs to be dynamic, fine at time of adding fresh widget
                        itemsData: this.items
                    });  
                    
                }
                // setInterval(this.setRequiresSync(), 5000);
            }
        }, 

        // Generates custom html for each dashing generated widget.
        generateHTML: function(){
            if(this.listId != undefined){
                var id = this.listWidgetIndex;
                // If there is a new list and its widget call this function
                if($("#widget").attr("data") == "NOT_CONFIGURED"){
                    if(id == -1){
                         id = numDashboardWidgets;
                    }
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
                        $("#addListButtonView").attr("id", "addListButtonView" + id);
            
                        // For unique buttons
                        $("#editButton").attr("id", "editButton" + id);
                        $("#settingsButton").attr("id", "settingsButton" + id);
                        $("#addNewItemButton").attr("id", "addNewItemButton" + id);
                        $("#saveEditButton").attr("id", "saveEditButton" + id);
                        $("#cancelEditButton").attr("id", "cancelEditButton" + id);
                        $("#saveSettingsButton").attr("id", "saveSettingsButton" + id);
                        $("#exitSettingsButton").attr("id", "exitSettingsButton" + id);

                        // For unique items (plural) container with locally unique item (singular) containers
                        $("#allItemsListView").attr("id", "allItemsListView" + id);
                        $("#allItemsEditView").attr("id", "allItemsEditView" + id);
            
                        // For each item (nth-child function starts at index 1)
                        for(var i = 1; i <= self.itemCount; i++){
                            $("#allItemsListView"+id+" #listItem:nth-child("+i+")").attr("id", "listItem" + i);
                            // $("#allItemsEditView"+id+" #editItem:nth-child("+i+")").attr("id", "editItem" + i);
                        }

                        self.initiallyPopulated = true;
                        
                        
                        // Set tag alerts
                        for(var i = 0; i < possibleTags.length; i++){
                            // Update tag alerts
                            if(!self.list_tags.contains(possibleTags[i])){
                                var tagName = possibleTags[i];
                                var tagAlertElement = $("#widget" + id + " #tagDisplay #" + tagName + "TagAlert");
                                tagAlertElement.attr('class', "tagColor UnsetColor");
                            }
                            else{
                                var tagName = possibleTags[i];
                                var tagAlertElement = $("#widget" + id + " #tagDisplay #" + tagName + "TagAlert");
                                tagAlertElement.attr('class', "tagColorSet " + tagName + "TagColor");
                            }
                        }
                        
                        
                        $("#listView" + id).show();
                    }
                }
            }
        },
        
        
        // TODO
        //  If we get a new list, we are just going to reload the page to force 
        //  the new list to be grabbed from DB. This is ghetto, yes. But I'm so close
        //  to ripping my face off bc I despise this project so much. This is good enough
        //  for a demo but we cannot be doing anything when this gets reloaded or else it 
        //  reveals the ghettoness. But it will seem as if it will reload only when the user 
        //  isn't currently doing something.
        
        // Occasisonally will ping DB new items
        sync: function(){
            // Only sync non-up-to-date widgets
            if(this.listId != undefined){
                // If we aren't already syncing this widget
                if(this.isSyncing === false){
                    this.isSyncing = true;

                    
                    // TODO - unsure at the time how to set this to true elsewhere
                    //  so that i dont hvae 16 calls to this function
                    // If this list is out of date then we will sync it
                    if(this.isOutOfDate === true){
                    
                        console.log("Widget " + this.listId + " syncing...");
                        
                        
                        // Call DB and supply timestamp
                        $.get('widgets/dashboard_helper/', {"keyword":"Sync", "username": username, "userid": userid, "listID": this.listId, "timestamp": this.lastSyncTimestamp, }, function(response){
                            // Process server's response
                            processResponse(this, response);
                        });
                        this.isOutOfDate = false;
                    }
                }
            }
        }, 
        
        
        // // Sets the widget to be considered out of date
        // setRequiresSync: function(){
        //     if(this.listId != undefined){
        //         if(this.isOutOfDate === false){
        //             console.log("Widget " + this.listId + " needs to sync");
        //             this.isOutOfDate = true;
        //         }
        //     }
        // },
        
        
        // Just a test function
        testFunc: function(id){
            console.log("Testfunction was called");
        },
        
        // Get scope 
        getScope: function(){
            console.log(this.scope);
            return this.scope;
        },
        
        // Set scope and updates local variables
        setScope: function(newScope){
            if(newScope){
                var title, timestamp, items;
                if(newScope[0])
                    title = newScope[0];
                if(newScope[1])
                    timestamp = newScope[1];
                if(newScope[2]){
                    items = newScope[2];
                    $.removeData(this.scope, "itemsData");
                }
                
                $.extend(this.scope, {title: title, updatedAt: timestamp, itemsData: items});
                
                console.log(items);
                
                // Clear for the update
                this.items_ids = [];
                this.items_labels = [];
                this.items_details = [];
                this.items_quantity = [];
                this.items_checkedStatus = [];
                
                for(var i = 0; i < items.length; i++){
                    this.items_ids.push(items[i].id);
                    this.items_labels.push(items[i].label);
                    this.items_details.push(items[i].details);
                    this.items_quantity.push(items[i].quantity);
                    this.items_checkedStatus.push(items[i].checkedStatus);
                }
                
                console.log(this.list_items_ids);
                console.log(this.items_labels);
                console.log(this.items_details);
                console.log(this.items_quantity);
                console.log(this.items_checkedStatus);
                
            }
            else{
                console.log("Could not set scope, response was not populated")
            }
        },
        
        // Handles the button listeners for each view of the widget
        updateWidget: function(){
            // console.log("Widget " + this.listId + " updating...");
            var self = this;
            if(this.listWidgetIndex != undefined){
                var id = this.listWidgetIndex;

                    var currentItemsInEditList = self.itemCount;
                    
                    
                    
                    // ########################
                    // List View Main Buttons
                    // ########################
                    
                    // TODO
                    // The edit view needs to be dynamically populated from the list state
                    //  at the time some selects the edit button
                    $("#editButton"+id).on("click", function(){
                        if(self.isEditingList === false){
                            // console.log("Open list edit pressed...");
                            
                            // Get the entire widget html and change size                        
                            var widget = $("#widget"+id).parent();
                            console.log(widget);
                            
                            var newWidgetSize = self.row + 1;
                            $(".gridster ul").data('gridster').resize_widget(widget,1,newWidgetSize);
                            
                            
                            // Show the edit items
                            var numItems = self.items_ids.length;
                            console.log("Found " + numItems + " items");
                            
                            // Loop through the current items
                            for(var i = 0; i < numItems; i++){
                                
                                var itemID = self.items_ids[i];
                                var itemLabel = self.items_labels[i];
                                var itemDetails= self.items_details[i];
                                var itemQuantity = self.items_quantity[i];
                                var itemCheckedStatus = self.items_checkedStatus[i];
                                console.log(itemID);
                                console.log(itemLabel);
                                console.log(itemDetails);
                                console.log(itemQuantity);
                                console.log(itemCheckedStatus);
                                
                                var editItemsContainer = $("#editView"+id+" #allItemsEditView"+id);
                                console.log(editItemsContainer);
                                
                                var editItemElement = $("#editView"+id+" .emptyItem");
                                console.log(editItemElement);
                                
                                var newEditItemElement = editItemElement.clone();
                                console.log(newEditItemElement);

                                // Add item attributes
                                editItemElement.removeClass('emptyItem');
                                editItemElement.addClass('filledItem');
                                editItemElement.find('.itemID').html(itemID);
                                editItemElement.find('#label').html(itemLabel);
                                editItemElement.show();
                                
                                
                                // console.log(editItemElement);
                                // console.log(newEditItemElement);

                                newEditItemElement.appendTo(editItemsContainer);


                                console.log(editItemsContainer);
                                
                                
                                
                            //     // var setTagElement = $("#settingsView"+id+" #setTagsWrapper [id="+tagName+"]");
                            //     // var editTagElement = $("#settingsView"+id+" #editTagsWrapper [id="+tagName+"]");
                            //     // if(setTagElement && editTagElement){
                            //     //     console.log(setTagElement);
                            //     //     console.log(editTagElement);
                                    
                            //     //     console.log("Found correct tag element");
                            //     //     // Make the tag button active to demonstrate the tag is set
                            //     //     // tagElement.addClass('active');
                                    
                            //     //     setTagElement.show();
                            //     //     editTagElement.hide();
                            //     // }
                            }
                            
                            
                            
                            $("#listView"+id).hide();
                            $("#editView"+id).show();
                            // self.editSaved = false;
                            self.isEditingList = true;
                            return;
                        }
                    });
                    
                    $("#settingsButton"+id).click(function(){
                        if(self.isEditingSettings === false){
                            // console.log("Open settings button pressed...");
                            
                            // Get the entire widget html and change size                        
                            var widget = $("#widget"+id).parent();
                            console.log(widget);
                            
                            var newWidgetSize = self.row + 1;
                            $(".gridster ul").data('gridster').resize_widget(widget,1,newWidgetSize);
                            
                            
                            
                            
                            // Show the tag buttons
                            var numTags = self.list_tags.length;
                            console.log("Found " + numTags + " tags");
                            
                            // Loop through the current tags
                            for(var i = 0; i < numTags; i++){
                                var tagName = self.list_tags[i];
                                console.log(tagName);
                                
                                // var tagElement = $(this).parent().parent().find(".tag").attr('id').is(tagName);
                                
                                var setTagElement = $("#settingsView"+id+" #setTagsWrapper [id="+tagName+"]");
                                var editTagElement = $("#settingsView"+id+" #editTagsWrapper [id="+tagName+"]");
                                if(setTagElement && editTagElement){
                                    console.log(setTagElement);
                                    console.log(editTagElement);
                                    
                                    console.log("Found correct tag element");
                                    // Make the tag button active to demonstrate the tag is set
                                    // tagElement.addClass('active');
                                    
                                    setTagElement.show();
                                    editTagElement.hide();
                                }
                            }
                            
                            
                      
                            // Show the user buttons
                            var numUsers = self.list_users.length;
                            console.log("Found " + numUsers + " users");
                            
                            // Loop through the current users
                            for(var i = 0; i < numUsers; i++){
                                var userName = self.list_users[i];
                                console.log(userName);
                                
                                // If not added already, add user
                                if($("#settingsView"+id+" #setUsersWrapper").find('#'+userName).text() == ""){
                                    // User button
                                    // var userElement = "<button id='"+userName+"' type='button' class='setUser btn btn-default btn-info'>"+userName+"</button>";
                                    $("#settingsView"+id+" #setUsersWrapper").append("<button id='"+userName+"' type='button' class='setUser btn btn-default btn-info'>"+userName+"</button>");

                                
                                }
                                
                                // var tagElement = $(this).parent().parent().find(".tag").attr('id').is(tagName);
                                
                                // var setTagElement = $("#setTagsWrapper [id="+tagName+"]");
                                // var editTagElement = $("#editTagsWrapper [id="+tagName+"]");
                                // if(setTagElement && editTagElement){
                                //     console.log(setTagElement);
                                //     console.log(editTagElement);
                                    
                                //     console.log("Found correct tag element");
                                //     // Make the tag button active to demonstrate the tag is set
                                //     // tagElement.addClass('active');
                                    
                                //     setTagElement.show();
                                //     editTagElement.hide();
                                // }
                            }
                            
                            
                            $("#listView"+id).hide();
                            $("#settingsView"+id).show();
                            
                            self.isEditingSettings = true;
                        }
                    });
                    
                    // Other functions
                    
                    // Show complete button on hover only
                    $("#listView"+id+" .itemContainer").hover(
                        // Mouse enter
                        function(){
                            var isChecked = $(this).find(".checkedStatus").text();
                            // console.log(isChecked);
                            
                            if(isChecked == "False"){
                                $(this).find("#itemCheckButton").show();
                                $(this).find("#itemUncheckButton").hide();
                                
                                $(this).find("#itemCheckButton").removeClass('shrink');
                                

                                $(this).find(".quantity").hide();
                            }
                            else{
                                $(this).find("#itemUncheckButton").show();
                                $(this).find("#itemCheckButton").hide();
                                $(this).find(".quantity").hide();
                            }
                            
                            // Outline
                            $(this).addClass('outlineElement');
                        },
                        
                        // Mouse exit
                        function(){
                            $(this).find("#itemUncheckButton").hide();
                            
                            $(this).find("#itemCheckButton").hide();
                            $(this).find("#itemCheckButton").addClass('shrink');

                            $(this).find(".quantity").show();
                            
                            // Outline
                            $(this).removeClass('outlineElement');
                        }
                    );
                    
                    // Check item
                    $("#listView"+id+" #checkButton").click(function(){
                        
                        // console.log("Item was checked");
                        var listItem = $(this).parent().parent().parent().parent();
                        // console.log(listItem);
                        
                        listItem.addClass("checkedItem");
                        
                        // if(self.isRemovingItem === false){
                        //   self.isRemovingItem = true; 
                        
                        //     // Get the item id from the editItem id
                        //     var itemToRemoveId = $(this).parent().parent().find(".itemID").text();
                            
                        //     // Get the element object to hide. Save or cancel do what is needed after element is no longer visible
                        //     var itemElementToRemove = $(this).parent().parent().parent();
                            
                        //     // console.log(itemToRemoveId[0]);
                        //     // console.log([itemToRemoveId]);
                        //     // If we don't already have this index
                        //     if(itemToRemoveId && !self.deletedItemIndexes.contains(itemToRemoveId)){
                        //         console.log("Removing item");
                        //         self.deletedItemIndexes.push(itemToRemoveId);
                        //         self.deletedItemIndexesString += itemToRemoveId +",";
                                
                        //         // TODO - place these in a container to hide them now, show if we cancel, and remove if we save
                        //         itemElementToRemove.hide();
                        //         // itemElementToRemove.remove();
                                
                        //         self.isRemovingItem = false;
                        //     }
                        // }
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
                            
                            
                            // First need to tie up loose ends
                            // If editing title
                            if(self.isEditingTitle){
                                var newName = $("#editView"+id+" #listNameInput").val();
                                $("#editView"+id+" #listNameInput").replaceWith("<h1 id='listName'>" + newName + "</h1>");
                                self.isEditingTitle = false;
                            }
                            
                            // If editing new or existing item
                            if(self.isEditingItem){
                                // Will accept item changes
                                var itemContainerToBeReplaced = $("#editView"+id+" #acceptItemChangeButton").parent().parent();
                                var newItem = itemContainerToBeReplaced.find('#newItemLabel').val();
                                
                                var itemID = itemContainerToBeReplaced.find('.itemID').text();
                                if(!itemID){
                                    // Set ID for new items
                                    itemID = -1;
                                }
                                
                                if(itemID && !self.modifiedItemIndexes.contains(itemID)){
                                    self.modifiedItemIndexes.push(itemID);
                                    self.modifiedItemIndexesString += itemID +",";
                                }
                                
                                itemContainerToBeReplaced.replaceWith("<div class='input-group'><span class='itemID' style='display:none'>"+itemID+"</span><span id='label'>" + newItem  + "</span><span id='itemDetailsButton' class='input-group-btn' style='display:none'><a id='itemDetails' class='btn btn-secondary btn-primary' role='button'>Details</a></span><span id='itemRemoveButton' class='input-group-btn' style='display:none'><a id='removeItem' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>");
                                self.isEditingItem=false;
                            }
                        
                            
                            
                            // Get all items currently in the edit view at time of save
                            var modifiedItems = new Array();
                            // var itemsString = "";
                            var itemsCount = 0;
                            $("#editView"+id+" #label").each(function(){
                                var item = $(this).text();
                                
                                if(!item){
                                    // Removing empty items
                                    console.log("Empty item in list edit ignored");
                                    // $(this).parent().hide();
                                }
                                else{
                                    
                                    var itemID = $(this).parent().find('.itemID').text();
                                    
                                    console.log("Getting updated item: " + item);
                                    
                                    if(modifiedItems.contains(item) === false){
                                        modifiedItems.push(item);
                                        self.itemsString += itemID +","+ item + "|";
                                        itemsCount++;
                                        
                                        // self.list_ids;
                                        
                                        // console.log(item);
                                    }
                                
                                }
                                // console.log(itemsString);
                            });
                            
                            // console.log("Items: " + modifiedItems);
                            // console.log(modifiedItems.toString());
                            
                            var newScope = {};
                            // Connect to server with modified data in request
                            $.get('widgets/dashboard_helper/', {"keyword":"ListDetailsEdit", "username": username, "userid": userid, "listID": self.listId, "listName": modifiedName, "listItems": self.itemsString, "listItemsModified": self.modifiedItemIndexesString, "listItemsRemoved": self.deletedItemIndexesString}, function(response){
                                // Process server's response
                                newScope = processResponse(self, response);
                                
                                // Must set scope to populate rivets in widget HTML
                                self.setScope(newScope);
                                
                                // // Remove the autogenerated item that resulted from setting the scope
                                // var editItemElements = $("#allItemsEditView"+id+" .itemID");
                                // for(var i=0; i < editItemElements.length; i++){
                                //     if(editItemElements[i].textContent == -1){
                                //         editItemElements[i].parentElement.parentElement.remove();
                                //     }
                                // }
                                // // // Change the one generated by new item button and simply give it unique html
                                // // $("#allItemsEditView"+id+" #editItem").attr("id", "editItem" + itemsCount);
                                

                                
                                // var editItemWithoutID = $("#allItemsEditView"+id+" #editItem");
                                // editItemWithoutID.attr('id', "editItem"+self.itemsCount);
                                
                                // Get the entire widget html and change size                        
                                var widget = $("#widget"+id).parent();
                                console.log(widget);
                                
                                if(self.itemCount < 5){
                                    // widget.attr('data-sizey', 1);
                                    $(".gridster ul").data('gridster').resize_widget(widget,1,1);
                                }
                                else if(self.itemCount < 12){
                                    // widget.attr('data-sizey', 2);
                                    $(".gridster ul").data('gridster').resize_widget(widget,1,2);
                                }
                                else if(self.itemCount < 20){
                                    // widget.attr('data-sizey', 2);
                                    $(".gridster ul").data('gridster').resize_widget(widget,1,3);
                                }
                                else if(self.itemCount < 28){
                                    // widget.attr('data-sizey', 2);
                                    $(".gridster ul").data('gridster').resize_widget(widget,1,4);
                                }
                                
                                
                                
                            });
                            
                            
                            var editItemsContainer = $("#editView"+id+" #allItemsEditView"+id);
                            console.log(editItemsContainer);
                            editItemsContainer.find('.itemEditContainer').each(function(){
                                if(!$(this).hasClass('emptyItem')){
                                    
                                    $(this).remove();
                                }
                            });


                            // Reset edit variables
                            self.itemsString = ""
                            self.modifiedItemIndexes = [];
                            self.modifiedItemIndexesString = "";
                            self.deletedItemIndexes = [];
                            self.deletedItemIndexesString = "";
                            
                            
                            
                            // View update
                            $("#editView"+id).hide();
                            $("#listView"+id).show();
                            
                            self.isEditingList = false;
                            
                            
                        }
                    });
                    
                    
                    
                    // Cancel the edit, don't save
                    $("#cancelEditButton"+id).click(function(){
                        if (self.isEditingList === true){
                            // console.log("Close edit list pressed");
                            
                            var editItemsContainer = $("#editView"+id+" #allItemsEditView"+id);
                            console.log(editItemsContainer);
                            
                            var clearedEditView = false;
                            while(!clearedEditView){
                                var itemToClear = editItemsContainer.find('.filledItem');
                                if(itemToClear){
                                    itemToClear.remove();
                                    clearedEditView = true;
                                }
                                else{
                                    clearedEditView = true;
                                }
                            }
                            
                            // Return to add list button view
                            $("#editView"+id).hide();
                            $("#listView"+id).show();
                            
                            // Get the entire widget html and change size                        
                            var widget = $("#widget"+id).parent();
                            console.log(widget);
                            
                            // Get the entire widget html and change size                        
                            var widget = $("#widget"+id).parent();
                            console.log(widget);
                            
                            // Remove etra space from edit view
                            var newWidgetSize = self.row;
                            $(".gridster ul").data('gridster').resize_widget(widget,1,newWidgetSize);
                            
                            
                            self.isEditingList = false;

                        }
                    });
                    
                    
                    
                    // Edit View Listeners 
                    // TODO - UI would look real nice if the buttons for each item only showed up on hover
                    //        Same for title, but could outlign or something on hovering over it
                    
                    // Title is clicked in edit view 
                    $("#editView"+id+" #listName").click(function(){
                        if (self.isEditingTitle === false){
                            // alert("List " + id + " title clicked...");
                            var oldName = $(this).text();
                            $(this).replaceWith("<input id='listNameInput' type='text' value='" + oldName + "'>");
                            self.isEditingTitle = true;
                        }
                    });
                    
                    
                    
                    // Accept title change
                    // On focusout
                   $("#editView"+id+" #listNameInput").focusout(function(){
                        if (self.isEditingTitle === true){
                            self.listName = $(this).val();
                            $(this).replaceWith("<h1 id='listName'>" + self.listName + "</h1>");
                            self.isEditingTitle = false;
                        }
                    });
                    // On enter key
                    $(document).on('keypress', function(e){
                        // Will accept title changes
                        if (self.isEditingTitle === true){
                            if(e.which == 13){
                                console.log("Pressed enter");
                                // $("#editView"+id+" #listNameInput").focusout(function(){
                                    var newName = $("#editView"+id+" #listNameInput").val();
                                    $("#editView"+id+" #listNameInput").replaceWith("<h1 id='listName'>" + newName + "</h1>");
                                    self.isEditingTitle = false;
                            }
                        }
                    });
                    
                    
                    
                    // Item is clicked in edit view, transform to text entry, don't increment itemsModifed until change accepted
                    $("#editView"+id+" #label").click(function(){
                        if (self.isEditingItem === false){
                            // alert("List " + id + " item clicked...");
                            var currentItem = $(this).text();
                            var currentItemID = $(this).parent().find(".itemID").text();
                            console.log("Item: " + currentItemID + " - " + currentItem);
                            $(this).parent().replaceWith("<div class='input-group'><span class='itemID' style='display:none'>"+currentItemID+"</span><span><input id='newItemLabel' type='text' value='" + currentItem + "'></input></span><span class='input-group-btn'><a id='acceptItemChangeButton' class='btn btn-secondary btn-success' role='button'>OK</a></span></div>");
                            $("#newItemLabel").focus();
                            
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
                        
                        if(itemID && !self.modifiedItemIndexes.contains(itemID)){
                            self.modifiedItemIndexes.push(itemID);
                            self.modifiedItemIndexesString += itemID +",";
                        }
                        
                        itemContainerToBeReplaced.replaceWith("<div class='input-group'><span class='itemID' style='display:none'>"+itemID+"</span><span id='label'>" + newItem  + "</span><span id='itemDetailsButton' class='input-group-btn' style='display:none'><a id='itemDetails' class='btn btn-secondary btn-primary' role='button'>Details</a></span><span id='itemRemoveButton' class='input-group-btn' style='display:none'><a id='removeItem' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>");
                        self.isEditingItem=false;
                    });
                    
                    
                    // On keypress
                    $(document).on('keypress', function(e){
                        if (self.isEditingItem === true){
                            
                            // Enter will save new item
                            if(e.which == 13){
                                // Will accept item changes
                                var itemContainerToBeReplaced = $("#editView"+id+" #acceptItemChangeButton").parent().parent();
                                var newItem = itemContainerToBeReplaced.find('#newItemLabel').val();
                                
                                var itemID = itemContainerToBeReplaced.find('.itemID').text();
                                if(!itemID){
                                    // Set ID for new items
                                    itemID = -1;
                                }
                                
                                if(itemID && !self.modifiedItemIndexes.contains(itemID)){
                                    self.modifiedItemIndexes.push(itemID);
                                    self.modifiedItemIndexesString += itemID +",";
                                }
                                
                                itemContainerToBeReplaced.replaceWith("<div class='input-group'><span class='itemID' style='display:none'>"+itemID+"</span><span id='label'>" + newItem  + "</span><span id='itemDetailsButton' class='input-group-btn' style='display:none'><a id='itemDetails' class='btn btn-secondary btn-primary' role='button'>Details</a></span><span id='itemRemoveButton' class='input-group-btn' style='display:none'><a id='removeItem' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>");
                                self.isEditingItem=false;

                            }
                        }
                        // // Tab will add new item
                        // else{
                        //     if(e.which == 9){
                        //         var newItemContainer = $("#editView"+id+" #hiddenItem"+id+"-"+self.itemsAdded);
                        //         if (newItemContainer && !self.isEditingItem){
                        //             // alert("Trying to get #editView"+id+" #hiddenItem"+id+"-"+self.itemsAdded); 
                        //             self.isEditingItem = true;
                        //             self.itemsAdded++;
                        //             var newEditItemId = self.itemCount + self.itemsAdded;
                        //             newItemContainer.replaceWith("<li id='editItem"+newEditItemId+"'><div class='input-group'><span><input id='newItemLabel' type='text' placeholder='New item' value=''></input></span><span class='input-group-btn'><a id='acceptItemChangeButton' class='btn btn-secondary btn-success' role='button'>OK</a></span></div></li><li id='hiddenItem"+id+"-"+self.itemsAdded+"'><div class='input-group' type='hidden'></div></li>");
                        //             $("#newItemLabel").focus();
                        //         }
                        //     }
                        // }
                    });
                    
                    
                    
                    // New Item, increment itemsAdded
                    $("#addNewItemButton"+id).click(function(){
                        var editItemElement = $("#editView"+id+" .emptyItem");
                        if (editItemElement && !self.isEditingItem){
                            // alert("Trying to get #editView"+id+" #hiddenItem"+id+"-"+self.itemsAdded); 
                            self.isEditingItem = true;
                            self.itemsAdded++;
                            
                            
                            
                            var itemID = -1;
                            var itemLabel = "";
                            var itemDetails= "";
                            var itemQuantity = "";
                            var itemCheckedStatus = true;
                            console.log(itemID);
                            console.log(itemLabel);
                            console.log(itemDetails);
                            console.log(itemQuantity);
                            console.log(itemCheckedStatus);
                            
                            var editItemsContainer = $("#editView"+id+" #allItemsEditView"+id);
                            console.log(editItemsContainer);
                            
                            var newEditItemElement = editItemElement.clone();
                            console.log(newEditItemElement);

                            // Add item attributes
                            editItemElement.removeClass('emptyItem');
                            editItemElement.find('.itemID').html(itemID);
                            editItemElement.find('#label').html(itemLabel);
                            editItemElement.show();
                            
                            
                            // console.log(editItemElement);
                            // console.log(newEditItemElement);

                            newEditItemElement.appendTo(editItemsContainer);


                            console.log(editItemsContainer);
                            
                            
                            editItemElement.replaceWith("<li id='editItem' class='itemEditContainer'><div class='input-group'><span><input id='newItemLabel' type='text' placeholder='New item' value=''></input></span><span class='input-group-btn'><a id='acceptItemChangeButton' class='btn btn-secondary btn-success' role='button'>OK</a></span></div></li>");
                            $("#newItemLabel").focus();

                            
                        }
                        // var newItemContainer = $("#editView"+id+" #hiddenItem"+id+"-"+self.itemsAdded);
                        // if (newItemContainer && !self.isEditingItem){
                        //     // alert("Trying to get #editView"+id+" #hiddenItem"+id+"-"+self.itemsAdded); 
                        //     self.isEditingItem = true;
                        //     self.itemsAdded++;
                        //     var newEditItemId = self.itemCount + self.itemsAdded;
                        //     newItemContainer.replaceWith("<li id='editItem"+newEditItemId+"' class='itemEditContainer'><div class='input-group'><span><input id='newItemLabel' type='text' placeholder='New item' value=''></input></span><span class='input-group-btn'><a id='acceptItemChangeButton' class='btn btn-secondary btn-success' role='button'>OK</a></span></div></li><li id='hiddenItem"+id+"-"+self.itemsAdded+"'><div class='input-group' type='hidden'></div></li>");
                        //     $("#newItemLabel").focus();

                            
                        // }
                    });
                    
                    
                    
                    // Removing item
                    $("#editView"+id+" #removeItem").click(function(){
                        if(self.isRemovingItem === false){
                           self.isRemovingItem = true; 

                        
                            // Get the item id from the editItem id
                            var itemToRemoveId = $(this).parent().parent().find(".itemID").text();
                            
                            // Get the element object to hide. Save or cancel do what is needed after element is no longer visible
                            var itemElementToRemove = $(this).parent().parent().parent();
                            
                            // console.log(itemToRemoveId[0]);
                            // console.log([itemToRemoveId]);
                            // If we don't already have this index
                            if(itemToRemoveId && !self.deletedItemIndexes.contains(itemToRemoveId)){
                                // self.isRemovingItem = true; 
                                console.log("Removing item");
                                self.deletedItemIndexes.push(itemToRemoveId);
                                self.deletedItemIndexesString += itemToRemoveId +",";
                                
                                // TODO - place these in a container to hide them now, show if we cancel, and remove if we save
                                // itemElementToRemove.hide();
                                itemElementToRemove.remove();
                                
                            }
                            self.isRemovingItem = false;
                        }
                    });
                    
                    // Other functions
                    
                    // Show buttons on hover only
                    $("#editView"+id+" .itemEditContainer").hover(
                        // Mouse enter
                        function(){
                            // Don't show buttons if we are editing the item
                            if (self.isEditingItem === false){
                                $(this).find("#itemDetailsButton").show();
                                $(this).find("#itemRemoveButton").show();
                                
                                // Outline
                                $(this).addClass('outlineElement');
                            }
                        },
                        
                        // Mouse exit
                        function(){
                            // Don't show buttons if we are editing the item
                            if (self.isEditingItem === false){
                                $(this).find("#itemDetailsButton").hide();
                                $(this).find("#itemRemoveButton").hide();
                                
                                // Outline
                                $(this).removeClass('outlineElement');
                            }
                        }
                    );
                    
                    
                    
                    // ############################
                    // Settings View Main Buttons
                    // ############################
                    $("#saveSettingsButton"+id).click(function(){
                        if(self.isEditingSettings === true){
                            // console.log("Save settings button pressed...");
                            
                            
                            // Save current edit
                            if(self.isEditingTags === true){
                                // console.log("Set list repeat button pressed...");
                                
                                // Toggle the display of edit tags
                                $("#settingsView"+id+" #editTagsWrapper").hide();
                                
                                // Replace the button
                                $(this).replaceWith("<button id='addTagButton' type='button' class='btn btn-default btn-default btn-block'>Edit tags</button>");
                                
                                // Set tag alerts
                                for(var i = 0; i < possibleTags.length; i++){
                                    // Update tag alerts
                                    if(!self.list_tags.contains(possibleTags[i])){
                                        var tagName = possibleTags[i];
                                        var tagAlertElement = $("#widget" + id + " #tagDisplay #" + tagName + "TagAlert");
                                        tagAlertElement.attr('class', "tagColor UnsetColor");
                                    }
                                    else{
                                        var tagName = possibleTags[i];
                                        var tagAlertElement = $("#widget" + id + " #tagDisplay #" + tagName + "TagAlert");
                                        tagAlertElement.attr('class', "tagColorSet " + tagName + "TagColor");
                                    }
                                }
                                
                                
                                self.isEditingTags = false;
                            }
                            
                            // Save current edit
                            // if(self.isEditingUsers === true){
                                
                            //     // Get user name
                            //     var userName = $("#settingsView"+id+" #setUserInput input").val();
                            //     console.log(userName);
                                
                            //     self.list_users.push(userName);
                                
                            //     // To ensure clean user entry for next user add
                            //     $("#settingsView"+id+" #setUserInput input").replaceWith("<input type='text' class='form-control' placeholder='Search for...'>");

                            //     var userElement = "<button id='"+userName+"' type='button' class='setUser btn btn-default btn-info'>"+userName+"</button>";
                            //     $("#settingsView"+id+" #setUsersWrapper").append(userElement);

                            //     // Toggle the display of edit users
                            //     $("#settingsView"+id+" #setUserInput").hide();
                            //     $("#settingsView"+id+" #setNewUserButton").show();

                            //     self.isEditingUsers = false;
                            // }
                            
                            
                            // Clear users and tags
                            // Removing users 
                            // $("#settingsView"+id+" .setUser").click(function(){
                            //     if(self.isEditingSettings === true){
                            //         if(self.isEditingUsers === true){
                                        
                            //             // Get tag name
                            //             var userName = $(this).attr('id');
                            //             console.log(userName);
                                        
                            //             if(self.list_users.contains(userName)){
                            //                 console.log("User was set, removing");
                                            
                            //                 // Remove the user
                            //                 $(this).remove();
                                            
                            //                 // Update local storage
                            //                 for(var i = 0; i < self.list_users.length; i++){
                            //                     if(userName == self.list_users[i]){
                            //                         self.list_users.splice(i, 1);
                            //                         return;
                            //                     }
                            //                 }
                            //             }
                            //         }
                            //     }
                            // });
                            

                            // Connect to server with modified data in request
                            $.get('widgets/dashboard_helper/', {"keyword":"ListSettingsEdit", "username": username, "userid": userid, "listID": self.listId, "listUsers": self.list_users.toString(), "listTags": self.list_tags.toString(), "leaveList": self.leaveList}, function(response){
                                // Process server's response
                                processResponse(self, response);
                                
                                // Get the entire widget html and change size                        
                                var widget = $("#widget"+id).parent();
                                console.log(widget);
                                
                                // Remove etra space from settings view
                                var newWidgetSize = self.row;
                                $(".gridster ul").data('gridster').resize_widget(widget,1,newWidgetSize);
                            });
                            
                            $("#settingsView"+id).hide();
                            $("#listView"+id).show();
                            self.isEditingSettings = false;
                        }
                    });
                    
                    
                    $("#exitSettingsButton"+id).click(function(){
                        if(self.isEditingSettings === true){
                            // console.log("Cancel settings button pressed...");
                            $("#settingsView"+id).hide();
                            $("#listView"+id).show();
                            self.isEditingSettings = false;
                            
                            // Get the entire widget html and change size                        
                            var widget = $("#widget"+id).parent();
                            console.log(widget);
                            
                            // Remove etra space from settings view
                            var newWidgetSize = self.row;
                            $(".gridster ul").data('gridster').resize_widget(widget,1,newWidgetSize);
                        }
                    });
                    
                    // Layout for settings functionality
                    
                    // Recurrence
                    //  This is a pseudo function, it will be designed to work,
                    //  but no sort of recurrence functionality for the list will be added.
                    
                    // Default lists are one-time list
                    // If repeat selected
                    $("#settingsView"+id+" #repeatButton").click(function(){
                        if(self.isEditingSettings === true){
                            // console.log("Set list repeat button pressed...");
                            
                        }
                    });
                    
                    
                    
                    //  These attributes addressed below will all be stored locally with the widget
                    //  Yay for not relying so heavily on jquery and html elements
                    
                    // Tags
                    //  These need to preset and have a color associated with them
                    //  Tag should be added to the widget window as button blocks colored with selected color
                    //  Tag should show "Remove" on hovering, and be removed on click
                    
                    // Toggle tag edit
                    $("#settingsView"+id+" #addTagButton").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingTags === false){
                            
                                // console.log("Set list repeat button pressed...");
                                
                                // Toggle the display of edit tags
                                $("#settingsView"+id+" #editTagsWrapper").show();
                                
                                var numTags = self.list_tags.length;
                                console.log("Found " + numTags + " tags");
                                
                                // Loop through the current tags
                                for(var i = 0; i < numTags; i++){
                                    var tagName = self.list_tags[i];
                                    console.log(tagName);
                                    
                                    var setTagElement = $("#settingsView"+id+" #setTagsWrapper [id="+tagName+"]");
                                    var editTagElement = $("#settingsView"+id+" #editTagsWrapper [id="+tagName+"]");
                                    if(setTagElement && editTagElement){
                                        console.log(setTagElement);
                                        console.log(editTagElement);
                                        console.log("Found correct tag element");
 
                                        // Show  setTag, hide tag
                                        setTagElement.show();
                                        editTagElement.hide();
                                    }
                                }
                                
                                for(var j = 0; j < possibleTags.length; j++){
                                    var tagName = possibleTags[j];
                                    console.log(tagName);
                                    
                                    var setTagElement = $("#settingsView"+id+" #setTagsWrapper [id="+tagName+"]");
                                    var editTagElement = $("#settingsView"+id+" #editTagsWrapper [id="+tagName+"]");
                                    
                                    if(!self.list_tags.contains(tagName)){
                                        
                                        setTagElement.hide();
                                        editTagElement.show();
                                    }
                               }
                                
                                // Replace the button
                                $(this).replaceWith("<button id='saveTagsButton' type='button' class='btn btn-default btn-default btn-block'>Save tags</button>");
                                
                                self.isEditingTags = true;
                            }
                        }
                    });


                    // Save tags edit
                    $("#settingsView"+id+" #saveTagsButton").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingTags === true){
                                // console.log("Set list repeat button pressed...");
                                
                                // Toggle the display of edit tags
                                $("#settingsView"+id+" #editTagsWrapper").hide();
                                
                                // Replace the button
                                $(this).replaceWith("<button id='addTagButton' type='button' class='btn btn-default btn-default btn-block'>Edit tags</button>");
                                
                                // Set tag alerts
                                for(var i = 0; i < possibleTags.length; i++){
                                    // Update tag alerts
                                    if(!self.list_tags.contains(possibleTags[i])){
                                        var tagName = possibleTags[i];
                                        var tagAlertElement = $("#widget" + id + " #tagDisplay #" + tagName + "TagAlert");
                                        tagAlertElement.attr('class', "tagColor UnsetColor");
                                    }
                                    else{
                                        var tagName = possibleTags[i];
                                        var tagAlertElement = $("#widget" + id + " #tagDisplay #" + tagName + "TagAlert");
                                        tagAlertElement.attr('class', "tagColorSet " + tagName + "TagColor");
                                    }
                                }
                                
                                
                                self.isEditingTags = false;
                            }
                        }
                    });
                    
                    // Removing tags 
                    $("#settingsView"+id+" .setTag").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingTags === true){
                                
                                // Get tag name
                                var tagName = $(this).attr('id');
                                console.log(tagName);
                                
                                if(self.list_tags.contains(tagName)){
                                    console.log("Tag was set, removing");
                                    
                                    // Hide the tag as set, show as available
                                    $(this).hide();
                                    $("#editTagsWrapper [id="+tagName+"]").show();
                                    
                                    // Update local storage
                                    for(var i = 0; i < self.list_tags.length; i++){
                                        if(tagName == self.list_tags[i]){
                                            self.list_tags.splice(i, 1);
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    
                    // Adding tags
                    $("#settingsView"+id+" .tag").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingTags === true){
                                // Get tag name
                                var tagName = $(this).text();
                                console.log(tagName);
                                
                                
                                if(!self.list_tags.contains(tagName)){
                                    console.log("Tag was not set, adding");
                                    
                                    // Hide the tag as set, show as available
                                    $(this).hide();
                                    $("#settingsView"+id+" #setTagsWrapper [id="+tagName+"]").show();
                                    
                                    // Update local storage
                                    self.list_tags.push(tagName);
                                }
                     
                            }
                        }
                    });
                    
                    // Shared setTag as remove button on hover only
                    $("#settingsView"+id+" .setTag").hover(
                        // Mouse enter
                        function(){
                            if(self.isEditingSettings === true){
                                if(self.isEditingTags === true){
                                    
                                    if(!$(this).attr('data')){
                                        var tagName = $(this).attr('id');
                                        var oldData = $(this).attr('class');
                                        
                                        $(this).attr('class', 'setTag btn btn-default btn-danger');
                                        $(this).attr('id', tagName);
                                        $(this).attr('data', oldData);
                                        $(this).html("Remove");
                                    }            
                                }
                            }
                        },
                        
                        // Mouse exit
                        function(){
                            if(self.isEditingSettings === true){
                                if(self.isEditingTags === true){
                                    if($(this).attr('data')){
                                        var tagName = $(this).attr('id');
                                        var oldClass = $(this).attr('data');
                                        
                                        $(this).attr('class', oldClass);
                                        $(this).attr('id', tagName);
                                        $(this).attr('data', '');
                                        $(this).html(tagName);
                                    }
                                }
                            }
                        }
                    );
                    
                    
                    
                    
                    // Collaborators
                    //  Should show username as button block (arbitrary color)
                    //  User should show "Remove" on hovering, and be removed on click
                    //  Add new collaborator should prompt a modal (maybe?) and ask for username
                    //  Don't worry about error checking, we know the usernames we will use in the demo
                    
                    // Toggle user edit
                    $("#settingsView"+id+" #setNewUserButton").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingUsers === false){
                            
                                // console.log("Set list repeat button pressed...");
                                
                                // Toggle the display of edit users
                                $(this).hide();
                                $("#settingsView"+id+" #setUserInput").show();
                                $("#settingsView"+id+" #setUserInput input").focus();
                                $("#settingsView"+id+" #setUserInput #addUserButton").addClass('disabled');
                                
                                var numUsers = self.list_users.length;
                                console.log("Found " + numUsers + " users");
                                
                                // // Loop through the current users and add 
                                // for(var i = 0; i < numUsers; i++){
                                //     var userName = self.list_users[i];
                                //     console.log(userName);
                                    
                                //     var userElement = "<button id='"+userName+"' type='button' class='setUser btn btn-default btn-info'>"+userName+"</button>";
                                //     $("#settingsView"+id+" #setUsersWrapper").append(userElement);
                                    // var setTagElement = $("#setTagsWrapper [id="+tagName+"]");
                                    // var editTagElement = $("#editTagsWrapper [id="+tagName+"]");
                                    // if(setTagElement && editTagElement){
                                    //     console.log(setTagElement);
                                    //     console.log(editTagElement);
                                    //     console.log("Found correct tag element");
 
                                    //     // Show  setTag, hide tag
                                    //     setTagElement.show();
                                    //     editTagElement.hide();
                                    // }
                                // }
                                
                            //     for(var j = 0; j < possibleTags.length; j++){
                            //         var tagName = possibleTags[j];
                            //         console.log(tagName);
                                    
                            //         var setTagElement = $("#setTagsWrapper [id="+tagName+"]");
                            //         var editTagElement = $("#editTagsWrapper [id="+tagName+"]");
                                    
                            //         if(!self.list_users.contains(tagName)){
                                        
                            //             setTagElement.hide();
                            //             editTagElement.show();
                            //         }
                            //   }
                                
                                // // Replace the button
                                // $(this).replaceWith("<button id='saveTagsButton' type='button' class='btn btn-default btn-default btn-block'>Save tags</button>");
                                
                                self.isEditingUsers = true;
                            }
                        }
                    });
                    
                    // Cancel new user add
                    $("#settingsView"+id+" #cancelAddUserButton").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingUsers === true){
                                
                                // To ensure clean user entry for next user add
                                $("#settingsView"+id+" #setUserInput input").replaceWith("<input type='text' class='form-control' placeholder='Search for...'>");

                                
                                // Toggle the display of edit users
                                $("#settingsView"+id+" #setUserInput").hide();
                                $("#settingsView"+id+" #setNewUserButton").show();
                                
                                self.isEditingUsers = false;
                            }
                        }
                    });


                    // Save the new user
                    $("#settingsView"+id+" #addUserButton").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingUsers === true){
                                
                                // Get user name
                                var userName = $("#settingsView"+id+" #setUserInput input").val();
                                console.log(userName);
                                
                                self.list_users.push(userName);
                                
                                // To ensure clean user entry for next user add
                                $("#settingsView"+id+" #setUserInput input").replaceWith("<input type='text' class='form-control' placeholder='Search for...'>");

                                var userElement = "<button id='"+userName+"' type='button' class='setUser btn btn-default btn-info'>"+userName+"</button>";
                                $("#settingsView"+id+" #setUsersWrapper").append(userElement);

                                // Toggle the display of edit users
                                $("#settingsView"+id+" #setUserInput").hide();
                                $("#settingsView"+id+" #setNewUserButton").show();

                                self.isEditingUsers = false;
                            }
                        }
                    });
                    // On enter key
                    $(document).on('keypress', function(e){
                        if (self.isEditingUsers === true){
                            if(e.which == 13){
                                
                                // Get user name
                                var userName = $("#settingsView"+id+" #setUserInput input").val();
                                console.log(userName);
                                self.list_users.push(userName);

                                // To ensure clean user entry for next user add
                                $("#settingsView"+id+" #setUserInput input").replaceWith("<input type='text' class='form-control' placeholder='Search for...'>");

                                var userElement = "<button id='"+userName+"' type='button' class='setUser btn btn-default btn-info'>"+userName+"</button>";
                                $("#settingsView"+id+" #setUsersWrapper").append(userElement);

                                // Toggle the display of edit users
                                $("#settingsView"+id+" #setUserInput").hide();
                                $("#settingsView"+id+" #setNewUserButton").show();

                                self.isEditingUsers = false;
                            }
                        }
                    });
                    
                    // User validation
                    $("#settingsView"+id+" #setUserInput input").on('keyup', function(){
                        
                        var currentUserValue = $(this).val();
                        
                        // TODO
                        //  There should be some server call to ask if the username is alright
                        
                        // Reject empty
                        if(currentUserValue == ""){
                            // Disable add until appropriate
                            if(!$("#settingsView"+id+" #setUserInput #addUserButton").hasClass('disabled')){
                                $("#settingsView"+id+" #setUserInput #addUserButton").addClass('disabled');
                            }                        }
                        else{
                            
                            if($("#settingsView"+id+" #setUserInput #addUserButton").hasClass('disabled')){
                                $("#settingsView"+id+" #setUserInput #addUserButton").removeClass('disabled');
                            }
                            
                        }
                    });
                    
                    // Removing users 
                    $("#settingsView"+id+" .setUser").click(function(){
                        if(self.isEditingSettings === true){
                            if(self.isEditingUsers === true){
                                
                                // Get tag name
                                var userName = $(this).attr('id');
                                console.log(userName);
                                
                                if(self.list_users.contains(userName)){
                                    console.log("User was set, removing");
                                    
                                    // Remove the user
                                    $(this).remove();
                                    
                                    // Update local storage
                                    for(var i = 0; i < self.list_users.length; i++){
                                        if(userName == self.list_users[i]){
                                            self.list_users.splice(i, 1);
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    
                    // Shared setUser as remove button on hover only
                    $("#settingsView"+id+" .setUser").hover(
                        // Mouse enter
                        function(){
                            if(self.isEditingSettings === true){
                                if(self.isEditingUsers === true){
                                    
                                    if(!$(this).attr('data')){
                                        var userName = $(this).attr('id');
                                        var oldData = $(this).attr('class');
                                        
                                        $(this).attr('class', 'setUser btn btn-default btn-danger');
                                        $(this).attr('id', userName);
                                        $(this).attr('data', oldData);
                                        $(this).html("Remove");
                                    }            
                                }
                            }
                        },
                        
                        // Mouse exit
                        function(){
                            if(self.isEditingSettings === true){
                                if(self.isEditingUsers === true){
                                    if($(this).attr('data')){
                                        var userName = $(this).attr('id');
                                        var oldClass = $(this).attr('data');
                                        
                                        $(this).attr('class', oldClass);
                                        $(this).attr('id', userName);
                                        $(this).attr('data', "");
                                        $(this).html(userName);
                                    }
                                }
                            }
                        }
                    );
                    
                    
                
                    // Delete/Leave list
                    //  If button is pressed, we will send request to DB and remove this entire widget from
                    //  the dashboard, this should be easy
                    $("#settingsView"+id+" #leaveListButton").click(function(){
                        if(self.isEditingSettings === true){

                            // Set flag for settings request to signal leaving list
                            self.leaveList = true;
                            
                            // Connect to server with modified data in request
                            $.get('widgets/dashboard_helper/', {"keyword":"ListSettingsEdit", "username": username, "userid": userid, "listID": self.listId, "listUsers": self.list_users.toString(), "listTags": self.list_tags.toString(), "leaveList": self.leaveList}, function(response){
                                // Process server's response
                                // processResponse(self, response);
                                console.log(response);
                                document.location.reload();
                            });
                            
                        }
                    });

                    
                    
                    
                    
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

var titleElement      =$("#addListName");


var newListName = "New list " + numDashboardWidgets;

var isEditingNewListTitle = false;




$(add_button).click(function(e){ //on add input button click
    e.preventDefault();
    if(newListItems < max_fields){ //max input box allowed
        newListItems++; //text box increment
        newListItemsIndex++; 
        $(wrapper).append("<div id='item"+newListItemsIndex+"' class='input-group'><input id='itemLabel"+newListItems+"' type='text' class='form-control'></input><span class='input-group-btn'><a id='removeItem' href='#' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>"); //add input box
        //$(wrapper).append('<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
    }
});



$(wrapper).on("click","#removeItem", function(e){ //user click on remove text
    e.preventDefault(); $(this).parent('span').parent('div').remove(); 
    newListItems--;
    // Notice we don't decrement newListItemsIndex
    // We keep that iterating forever for item div indexing
});


// Title is clicked in edit view 
$("#addListName").click(function(){

    isEditingNewListTitle = true;
    var oldName = $(this).text();
    $(this).replaceWith("<input id='addListNameInput' type='text' value='" + oldName + "'>");
    $("#addListNameInput").focus();
    return;
});

// Accept title change
// On focusout
$("#addListNameInput").focusout(function(){
    newListName = $(this).val();
    $(this).replaceWith("<h3 id='addListName'>"+newListName+"</h3>");
});


// On enter key
$(document).on('keypress', function(e){
    if(e.which == 13){
        
        // Will accept title changes
        if(isEditingNewListTitle === true){
            console.log("Pressed enter");
            // $("#editView"+id+" #listNameInput").focusout(function(){
            var newName = $("#addListNameInput").val();
            $("#addListNameInput").replaceWith("<h3 id='addListName'>"+newName+"</h3>");
            isEditingNewListTitle = false;
        }
            
        else{
            if(newListItems < max_fields){ //max input box allowed
                newListItems++; //text box increment
                newListItemsIndex++; 
                
                var nextLabelID = "itemLabel"+newListItems;
                $(wrapper).append("<div id='item"+newListItemsIndex+"' class='input-group'><input id='"+nextLabelID+"' type='text' class='form-control'></input><span class='input-group-btn'><a id='removeItem' href='#' class='btn btn-secondary btn-danger' role='button'>Remove</a></span></div>"); //add input box
                $("#"+nextLabelID).focus();
                //$(wrapper).append('<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
            }
        }
    }
});





$(add_list).click(function(){
    console.log("Adding new list, there were " + numDashboardWidgets + " lists. Adding another...");
    numDashboardWidgets++;
    // var newListId = numDashboardWidgets;
    
    // Get the title (If empty title, give it one)
    var inputName = $("#addListName").text();
    
    if(inputName)
        newListName = inputName;
    else
        newListName = "New list " + numDashboardWidgets;

    
    var newItems = new Array();
    var itemsString = "";
    for(var i = 1; i <= newListItems; i++){
        //console.log(newItemsContainer.find("#item"+i+" input").val());
        // Add the new items to an array
        // var item = {label: newItemsContainer.find("#item"+i+" input").val(), value: ''};
        var item = newItemsContainer.find("#item"+i+" input").val();
        if(item){
            // console.log(item);
            newItems.push(item);
            itemsString += "-1,"+ item + "|";
        }
        else{
            console.log("Empty item in new list ignored");
        }

        // console.log(newItems[i-1]);
        // console.log(itemsString);
    }

    // Get name of list at time of save
    // var modifiedName = $("#editView"+id+" #listName").text();
    // console.log("Modified name: " + modifiedName);
    
    // Get all items currently in the edit view at time of save
    // var modifiedItems = new Array();
    // var itemsString = "";
    // $("#editView"+id+" #label").each(function(){
    //     var item = $(this).text();
    //     var itemID = $(this).parent().find('.itemID').text();
    //     console.log("Getting updated item: " + item);
    //     if(modifiedItems.contains(item) === false){
    //         modifiedItems.push(item);
    //         itemsString += itemID +","+ item + "|";
            
    //         // console.log(item);
    //     }
    //     // console.log(itemsString);
    // });
    
    // TODO - need to call DB to give new items
    //        the widget should then be made from data extracted from process request
    // Perhaps it would be better to place within process request
        // Connect to server and request data for user username
    $.get('widgets/dashboard_helper/', {"keyword":"AddListRequest", "username": username, "userid": userid, "listID": (-1).toString(), "listName": newListName, "listItems": itemsString}, function(response){
        // Process server's response
        processResponse(null, response);
        document.location.reload();

    });
    
    
    
});



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