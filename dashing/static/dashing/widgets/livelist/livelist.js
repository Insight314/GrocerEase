/* global Dashing */

Dashing.widgets.LiveList = function (dashboard) {
    var self = this;
    self.__init__ = Dashing.utils.widgetInit(dashboard, 'livelist');
    self.interval; // 10s refresh rate (Default is 1s)
                          // Applies only to the syncing function as defined in 
                          //    dashing.js addWidget() method
    

    self.scope = {}; // Holds the attributes to be given to html
    
    
    // Unique attributes
    //  These are initialized to null so configureWidget can uniquely identify
    //  newly created widgets and assign all attributes
    self.listID;
    self.listName; 
    self.itemCount;
    self.items;
    
    // Modified in edit view
    self.itemsAdded;
    self.itemsDeleted;
    self.itemsModifed;
    self.isEditingItem;
    
    self.deletedItemIndexes;
    
    self.row;
    self.col;
    
    self.initiallyPopulated;
    
    // Return self
    self.getWidget = function () {
        return this.__widget__;
    };
    
    
    // Methods defined at widget creation
    self.configureWidget = function () {}; // Configures new widget instance to a particular list
    
    // Manages communication with server to either send new data or update currentlyy displayed data 
    self.sync = function () {};
        // if(self.listID != null){
        //     alert("List " + self.listID + " updated");
        // }
        // Throw some trash in here
        
        // If I have new data, send to server
        // Else send request for any new items (This branch would be used for the interval at which this function will 
        //  be called.
        
        // Get response from server 
            // TODO - Ask Kevin how we are doing syncing
            // I am going to start with managing the status of my list first (Has anything changed?)
            // and then simply write a function in the Dashboard helper to extract 5 arrays
            // that will hold "since last sync" data:
            //  ItemsAdded - [New item 1, new item 2, ... ] 
            //  ItemsDeleted - [Old item 1, old item 2, ... ]  - Should these be ID's or names?
            
            //  ItemsModified - [Item 1 index, Item 2 index, ... ]
            //  AttributeStatus - [Title (0/1), Tag (0/1), Other setting, ... ]
                // Each index is an attribute that has not changed (0) or has changed
            // Changes - []
                // ItemsModified.length + (AttributeStatus.length - indexes with no change (0)) = Changes.length
                // The items that were modified will be stored first in the array followed by the attributes that 
                //  need to be modified.
                
            // Example of proposed
            // ItemsModified = [1, 2] (A list has mdofied items 1,2)
            // AttributeStatus = [1,0, ... ,(don't know all tags), ... ] (User has modifed the list's title)
            // Changes = ["Turkey", "Lettuce", "Turkey Sandwich List"]
        
    // };
    
    // Manages the html changes that may occur with list modification
    self.updateWidget = function(){};

    // Called on short interval, button listeners
    // self.listenForButtons = function() {
    //     $("#editButton").click(function(){
    //         // alert("editButton pressed...")
    //         $("#listView").hide(500);
    //         $("#editView").show(500);
    //     });
    //     $("#settingsButton").click(function(){
    //         // alert("settingsButton pressed...")
    //         $("#listView").hide(500);
    //         $("#settingsView").show(500);
    //     });

    //     $("#saveEditButton").click(function(){
    //         // alert("editButton pressed...")
    //         $("#editView").hide(500);
    //         $("#listView").show(500);
    //     });
    //     $("#cancelEditButton").click(function(){
    //         // alert("settingsButton pressed...")
    //         $("#editView").hide(500);
    //         $("#listView").show(500);
    //     });
        
    //     $("#saveSettingsButton").click(function(){
    //         // alert("editButton pressed...")
    //         $("#settingsView").hide(500);
    //         $("#listView").show(500);
    //     });
    //     $("#exitSettingsButton").click(function(){
    //         // alert("settingsButton pressed...")
    //         $("#settingsView").hide(500);
    //         $("#listView").show(500);
    //     });
    // };

    // // This function takes the generated items components and gives each a unique id
    // $('.item').each(function(idx) {
    //     alert($(this));
    //     $(this).attr('id', 'item' + idx);
    // });
    
    // /*To Show There are IDs*/
    // $('.item').each(function(){
    //   console.log($(this).attr("id"));
    // });
    
    
    
    // $('#item0').click(function(){
    //     var name = $(this).text();
    //     $(this).html('');
    //     $('<input></input>')
    //         .attr({
    //             'type': 'text',
    //             'name': 'fname',
    //             'id': 'txt_item0',
    //             'size': '30',
    //             'value': name
    //         })
    //         .appendTo('#item0');
    //     $('#txt_item0').focus();
    // });
    
    // $(document).on('blur','#txt_item0', function(){
    //     var label = $(this).val();
    //     //alert('Make an AJAX call and pass this parameter >> name=' + name);
    //     $('#item0').text(label);
    // });
    
    // This works only when opening menubar modals
    // $(document).click(function(){
    //     alert("Click");
    // });
};


// This works only with menubar modals by clicking close
// $(document).click(function(){
//     alert("Click");
// });