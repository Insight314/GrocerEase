# Data Mamager's Dashboard Helper
# Provides an interface for each dashboard to connect.

import json, models, views

from django.http import HttpResponse
from django.views.generic.detail import View

from dashing.widgets import JSONResponseMixin



# Base Widget class
#   This class is borrowed from the base widget class in dashing/widgets.py
#   There is an added line for processing a request. 
class Widget(JSONResponseMixin, View):
    # This is the function called on any get request
    #   Unsure where this gets called from but we could possiblt duplicate for POST
    #   Simply making a copy of this function as post does not work
    def get(self, request, *args, **kwargs):
        context = self.process_request(request)
        # context = json.dumps(self.get_context())
        return HttpResponse(context, content_type="application/json")
        
    def render_to_response(self, context, **response_kwargs):
        return self.render_to_json_response(context, **response_kwargs)
        
    # The below are overriden by the LiveList Widget 
    #   These lines silence syntax warnings
    def process_request(self, request):
        return
    def get_context(self):
        return



# Class that interacts with the dashboard widgets
class DashboardHelper(Widget):

    #####################
    # Request Processing
    #####################
    
    # Routes requests to the correct request handler function
    #   This is the target of dashboard requests from dashing-config.js
    def process_request(self, request):
        try:
            # Get the processing keyword
            keyword = str(request.GET.__getitem__('keyword'))
            
            # Initial population of the dashboard
            if keyword == "InitialLoad":
                print "Received initial load request"
                return json.dumps(self.initial_load(request))
                
            # List details edit requests
            if keyword == "ListDetailsEdit":
                print "Received details edit request"
                return json.dumps(self.processEditDetailsRequest(request))
                
            # List settings edit request
            if keyword == "ListSettingsEdit":
                print "Received settings edit request"
                return json.dumps(self.processEditSettingsRequest(request))
            
            # Sync request
            if keyword == "Sync":
                print "Received sync request"
                return json.dumps(self.processSyncRequest(request))
                
            # Add list request
            if keyword == "AddListRequest":
                print "Received add list request"
                return json.dumps(self.processAddListRequest(request))
                
        except Exception, e:
            print "Unexpected request, exception: "
            print e
            
        return



    # Handles response for initial dashboard population request
    def initial_load(self, request):
        # Containers
        lists=[]
        list_ids=[]
        list_names=[]
        list_items_ids=[]
        list_items=[]
        list_items_quantity=[]
        list_items_details=[]
        list_items_checkedStatus=[]
        
        list_users=[]
        list_tags=[]
        
        username = str(request.GET.__getitem__('username'))
        userid = str(request.GET.__getitem__('userid'))
        
        print "User: "+ username +"  ID: " + userid
        
        # Get all user's lists and package for response
        lists = self.getAllUsersLists(username)
        print lists
        if lists:
            numLists = len(lists)
            print "User has " + str(numLists) + " lists"
            
            # Loop through each list and populate attributes
            for x in range(0, numLists):
                list1 = lists[x]
                if list1: 
                    list_ids += [str(list1.list_id)]
                    list_names += [str(list1.list_name)]

                    # Add delimiters
                    list_items_ids += [str(".")] # Used as delimiter
                    list_items += [str(".")]
                    list_items_quantity += [str(".")]
                    list_items_details += [str(".")]
                    list_items_checkedStatus += [str(".")]
                    
                    list_users += [str(".")]
                    list_tags += [str(".")]
                    
                    
                    # List id will preceed the attributes for that list in their containers
                    list_items_ids += [str(list1.list_id)] 
                    list_items += [str(list1.list_id)]
                    list_items_quantity += [str(list1.list_id)]
                    list_items_details += [str(list1.list_id)]
                    list_items_checkedStatus += [str(list1.list_id)]
                    
                    list_users += [str(list1.list_id)]
                    list_tags += [str(list1.list_id)]
                    
                    print "List - " + str(list1.list_name) + " (ID: " + str(list1.list_id) + "): "


                    # Get all user's items 
                    items = self.getAllListItems(username, list1.list_id)
                    if items:
                        # Add each item to the list
                        for item in items:
                            if item:
                                list_items_ids += [str(item.item_id)]
                                list_items += [str(item.item_name)]
                                list_items_quantity += [str(item.item_quantity)]
                                list_items_details += [str(item.item_details)]
                                list_items_checkedStatus += [str(item.checked_status)]
                            else:
                                print "Could not get item for packaging"
                    else:
                        print "Could not get items for packaging"


                    # TODO 
                    #   Need getAllListUsers, and getAllListTags
                    
                    
                    # This test works! 23 April 1:03am
                    # list_users += [str("AbelT"), str("CGDrewry"), str("JJG")]
                    # list_tags += [str("Healthy")], [str("Meal")]
                    
                    
                    # Get all user's collaborators
                    l_users = list1.list_users.all()
                    
                    for i in l_users:
                        if i.username != username:
                            list_users += [i.username]
                    
                    
                    #Get all of the list's tags
                    tags = list1.list_tags.all()
                    
                    for i in tags:
                        list_tags += [i.tag_name]
                        
                    
                    
                    
                    # users = self.getAllListUsers(username, list1.list_id)
                    # if users:
                    #     # Add each user to the list
                    #     for user in users:
                    #         if user:
                    #             list_users += [str(user)]
                    #         else:
                    #             print "Could not get user for packaging"
                    # else:
                    #     print "Could not get users for packaging"

                    # Get all user's tags
                    # tags = self.getAllListTags(username, list1.list_id)
                    # if tags:
                    #     # Add each tag to the list
                    #     for tag in tags:
                    #         if tag:
                    #             list_tags += [str(tag)]
                    #         else:
                    #             print "Could not get tag for packaging"
                    # else:
                    #     print "Could not get tags for packaging"



                else:
                    print "Could not get list for packaging"
                    return
            return {
                'keyword': "InitialLoad",
                'list_ids': list_ids,
                'list_names': list_names,
                'list_items_ids': list_items_ids,
                'list_items': list_items,
                'list_items_quantity': list_items_quantity,
                'list_items_details': list_items_details,
                'list_items_checkedStatus': list_items_checkedStatus,
                'list_users': list_users,
                'list_tags': list_tags,
            }
        else:
            print "Could not get users lists for client initial info population response "
            return
        
        
        
    # Processes the edit list details requests
    def processEditDetailsRequest(self, request):
        
        # Extract request data
        username = str(request.GET.__getitem__('username'))
        # Get the list_id
        try:
            list_id = str(request.GET.__getitem__('listID'))
            print list_id
        except:
            print "Edit requesst did not have listID"
        
        list_name=str(request.GET.__getitem__('listName'))
        
        list_items=str(request.GET.__getitem__('listItems'))
        print "Added/Existing: "
        print list_items
    
        list_items_modified=str(request.GET.__getitem__('listItemsModified'))
        print "Modified:"
        print list_items_modified
        
        list_items_removed=str(request.GET.__getitem__('listItemsRemoved'))
        print "Removed: "
        print list_items_removed
        
        # TODO 
        # These need to be placed in the request from the front end
        list_items_quantity=""
        list_items_details=""
        list_items_checked_status = ""
        
        print "These are the list_items: "
        print list_items
        
        
        list_items_modified = list_items_modified.split(',')
        for i in list_items_modified:
            if i == '':
                list_items_modified.remove(i)
                
        print "These are the items to modify: "
        print list_items_modified
        
        #split up the list items
        split_items = list_items.split('|')
        print "Split items: "
        print split_items
        
        # Set initially as fail 
        dbAck = "Fail"
        
        # Handle removing item
        if list_items_removed != "":
            split_items = list_items_removed.split(',')
            if split_items:
                for i in split_items:
                    if i != -1 and i != "":
                        try:
                            if views.remove_item(i) == 1:
                                dbAck = "Success"
                            else:
                                dbAck = "Fail"
                        except:
                            print "Remove item failed"

        #Handle Creating an item
        for item in split_items:
            split_item = item.split(',')
            
            if split_item[0] == '-1':
                try:
                    print "creating item"
                    if views.create_item(username,list_id,split_item[1],'','') == 1:
                        dbAck = "Success"    
                    else:
                        print "Item creation failed"
                        dbAck = "Fail"
                except:
                    print "Editing list " + list_id + " item failed"
           
                
        # Get list
        tmpList = views.get_list(list_id)
            
        # Changes the name of the list if the name is different when compared
        if tmpList.list_name != list_name:
            try:
                if views.title_edit(list_id,list_name) == 1:
                    dbAck = "Success"
                else:
                    print "Title edit failed"
                    dbAck = "Fail"
            except:
                print "Editing list " + list_id + " title failed"


        #gather which items need to be modified 
        split_item_ids = []
        for item in split_items:
            if item != '':
                split_item = item.split(',')
                print "split_item: "
                print split_item
                split_item_ids.append(split_item[0])
                
        print "split item ids: "
        print split_item_ids
        
        items_to_be_modified = set(split_item_ids).intersection(list_items_modified)
        print "these are the items to modify: "
        print items_to_be_modified
        
        #edit the item 
        for item in split_items:
            print "editing the items"
            split_item = item.split(',')
            
            for ids in items_to_be_modified:
                if split_item[0] == ids:
                    if views.edit_item(split_item[0],split_item[1],'','',0) == 1:
                        dbAck = "Success"
                    else:
                        dbAck = "Fail"
        
    
        print "Packaging edit list ack"
    
        return self.packageListDetails(username, list_id, dbAck, "ListDetailsEdit")
    
    

    # TODO
    #   Needs testing
    #   Needs packageListSettings
    
    # Process the edit list settings requests: add/remove users, add/remove tags
    def processEditSettingsRequest(self, request):
        
        print request

        
        # Get the username
        username = str(request.GET.__getitem__('username'))
        print username
        
        # Get the listId
        try:
            listId = str(request.GET.__getitem__('listID'))
            print listId
        except:
            print "Edit requesst did not have listID"
            
        # Get the user's usernames that are associated with the list (.split() with comma)
        users = str(request.GET.__getitem__('listUsers'))
        print "Users set: "
        print users

        # Get the lists tags (.split() with comma)
        tags = str(request.GET.__getitem__('listTags')) 
        print "Tags set: "
        print tags
        
        # Get the user leave list flag (boolean)
        leaveList = str(request.GET.__getitem__('leaveList'))
        print "Leave list?: "
        print leaveList
        
        # This is what you had written, but we can't use the user_id, I've updated the 
        #   request pulls above to reflect this
        
                # # Get the user's user_ids associated with the list
                # userIds = str(request.GET.__getitem__('listUsers'))
                # print userIds
                
                # # Get the lists tags, NOTE: same format as items [id,tag_name], also split the same way 
                # tags = str(request.GET.__getitem__('listTags'))
                # print tags
        
        
        
        # Settings attributes notes

        #   In the request, you are receiving a CSV list of usernames.
        #   I know you were prepared for ID but it since usernames could be a primary key
        #       thanks to the registration part of the website that handles unique usernames
        #   listUsers: all users at the time of save (what the DB should have after updating)
        #   listUsersAdded: all users not currently associated with this list
        #   listUsersRemoved: all users that are removed from sharing list
        #   ********** It is quite probable that I will include the "Leave list" functionality here
        #               since all we need is the current list viewer (username) to be in the 
        #               listUsersRemoved to remove him.
        
        #   In the request, you will also receive a list of tags.
        #   Since we are running out of time fast, I have made a selection of tags
        #       that users can select from. This gives me only 5-6 tags I have to deal with.
        #   If you have any complaints about this, sorry but I'm not sorry,
        #       bc this will save me from having to worry about too many colors for tags,
        #       custom tag entry, and color selection for each. Lot of time I don't have.
        #   So, since Chris is pulling directly from the DB, if we only add the specified 
        #       tags to the tags table and then just update the fK for each list when you get and
        #       update from me. Man, after that long winded though I just wrote, the structs I've made for
        #       you aboove are:
        #   listTags: all tags at the time of save (what the DB should have after updating)
        #   listTagsAdded: all tags added and not currently associated with this list
        #   listTagsRemoved: all tags that are removed from list        
        #       *Again, tags are tag names not ids, in csv but we will only have a specified amount and each unique
        
        #   Preset tags: (IDs dont matter so you can set accordingly, I only need tag name)
        #       Healthy, Unhealthy, Cheap, Expensive, Meal
        
        

     
        # TODO
        #   We need to test adding and removing users and shit when we are both ready
        
        #Should be able to split tags the same way we split items
        split_tags = tags.split(',')
        print "tags given to me: "
        print split_tags
        
        split_users = users.split(',')
        print "users on my end: " 
        print split_users
        
        dbAck = "Fail"
      
      
        #Gather list of users to be removed from the list
        if listId:
            tmpList = views.get_list(int(listId))
            print "is it failing after this?"

        tmpListUsers = tmpList.list_users.all()
        print tmpListUsers
        usersToRemove = []
        alreadyAdded = []
        tmp_list = []
        
        for i in tmpListUsers:
            tmp_list.append(str(i.username))
            
        for i in tmp_list:
            for j in split_users:
                if str(i) == str(j):
                    alreadyAdded.append(str(j))
              
        usersToRemove = set(tmp_list).symmetric_difference(alreadyAdded)
        usersToRemove.remove(username)
        print "users to remove"
        print usersToRemove
        
        #Gather list of tags to be removed from the list
        tmpListTags = tmpList.list_tags.all()
        print tmpListTags
        tagsToRemove = []
        tagsAlreadyAdded = []
        tmp_tag_list = []
        
        for i in tmpListTags:
            tmp_tag_list.append(str(i.tag_name))
            
        for i in tmp_tag_list:
            for j in split_tags:
                if str(i) == str(j):
                    tagsAlreadyAdded.append(str(j))
                    
        tagsToRemove = set(tmp_tag_list).symmetric_difference(tagsAlreadyAdded)
        print "tags to remove"
        print tagsToRemove
        
        #users add/remove
        for user in split_users:
            if user:
                try:
                    print "trying to add a user"
                    if views.add_user(listId,user) == 1:
                        print "add user success?"
                        dbAck = "Success"
                    else:
                        print "add user fail"
                        dbAck = "Fail"
                except:
                    print "Add user failed or whatever dont know why wtf omg i hate this"
                    
        if usersToRemove:
            for user in usersToRemove:
                try:
                    print "trying to remove a user"
                    if views.remove_user(listId,user) == 1:
                        dbAck = "Success"
                    else:
                        print "remove user failed"
                        dbAck = "Fail"
                except:
                    print "Remove user failed or whatever oh noes"
        
        #tags add/remove
        for tag in split_tags:
            if tag:
                try:
                    print "trying to add a tag"
                    if views.add_tag(listId,str(tag)) == 1:
                        dbAck = "Success"
                    else:
                        print "add tag failed"
                        dbAck = "Fail"
                except:
                    print "add tag failed"
        
        if tagsToRemove:
            for tag in tagsToRemove:
                try:
                    print "trying to remove a tag"
                    if views.remove_tag(listId,str(tag)) == 1:
                        dbAck = "Success"
                    else:
                        print "remove tag failed"
                        dbAck = "Fail"
                except:
                    print "remove tag failed"
             
        #Delete list if needed
        if leaveList:
            if views.delete_list(listId) == 1:
                dbAck = "Success"
            else:
                dbAck = "Fail"
                
        return self.packageListSettings(username, listId, "Success", "ListSettingsEdit")



    # Process sync requests
    def processSyncRequest(self, request):
        # Get the username
        username = str(request.GET.__getitem__('timestamp'))
        print username
        # Get the listId
        listId = str(request.GET.__getitem__('listID'))
        print listId
        # Get the timestamp for last update
        timestamp = str(request.GET.__getitem__('timestamp'))
        print timestamp
        
        # TODO 
        # Correct format:
        # 2016-04-12 03:05:10+00:00
        formattedTimestamp = self.convertTimestamp(timestamp);
        print formattedTimestamp
        
        # Used to flag client that no new info was sent
        #   Since default return from this, processSyncRequest, is no info,
        #   we default to fail
        dbAck = "Fail" # DB ack - Was DB update successful? ("Success/Fail")
        
        
        # TODO
        # If the timestamp given is less than latest db update, they need to be updated
        if(0):
            tmp_ts = views.get_timestamp(listId)
            #if something something compare things:
                #update things
                
                
            
            # Abel I need your timestamp compare stuff here and also please
            #   populate the dbAck var
            
            
            # Maybe if we do if the timestamp I send you is more than some
            #   time limit, then we update. Having this threshold rather than an
            #   explicit value the timestamp should be makes the front end 
            #   sync timing easier.
            
            
            
            print "Packaging sync ack"
            return self.packageListDetails(username, listId, dbAck, "Sync")
            
            
        # If they have the latest info, server doesn't want to waste time
        else:
            return { 'Ack': dbAck, 'keyword': "Sync" }  
        
        
        
    # Process the add list requests
    def processAddListRequest(self, request):
        # Get the username
        username = str(request.GET.__getitem__('username'))
        print username
        # Get the userid
        userid = str(request.GET.__getitem__('userid'))
        print userid
        
        # Get the list_id
        # list_id = str(request.GET.__getitem__('listID'))
        # print list_id
        # Get the title
        name = str(request.GET.__getitem__('listName'))
        print name
        # Get the items
        listItems = str(request.GET.__getitem__('listItems'))
        print listItems
        
        dbAck = "Fail" # DB ack - Was DB update successful? ("Success/Fail")
        
     
        # Item settings wont be able to be set yet, thus we
        #   need to establish defaults for item details, quantity (can be null for new db record)
        #   as well as for all list settings

        # List creation
        try:
            ack = views.create_list(username,name)
            list_id = ack[0]
            wasSuccess = ack[1]
            
            if wasSuccess == 1:
                dbAck = "Success"
            else:
                dbAck = "Fail"
        except:
            return "List creation failed for: " + name
        
        # Only create items for list if the list was successfully created
        if dbAck == "Success":
            
            print "Create list success"
            
            #item creation
            split_items = listItems.split('|')
            for item in split_items:
                item.split(',')
                    
            print "Split items success"

            # Add any items to the database/list that are not already in it
            for item in split_items:
                print "Adding item: " + item
                split_item = item.split(',')
                if split_item[0] == '-1':
                    print "Item has correct ID"
                    try:
                        print split_item[1]
                        if views.create_item(username,list_id,split_item[1],'','') == 1:
                            print "...created item"
                            dbAck = "Success"    
                        else:
                            print "Item creation failed"
                            dbAck = "Fail"
                    except:
                        print "Editing list " + list_id + " item failed"
                        
            print "Packaging add list ack"
            return self.packageListDetails(username, list_id, dbAck, "AddListRequest")
        
        # If DB create list fails then just return the failure    
        else:
            print "Packaging add list ack (Failed)"
            return self.packageListDetails(username, 1, dbAck, "AddListRequest")



    #####################
    # Helper functions
    #####################
    
    # Returns updated records of specified list details from the DB packaged for use by the dashboard
    def packageListDetails(self, username, list_id, dbAck, keyword):
        if dbAck != "Fail":
            list_items = []
            list_items_ids=[] 
            list_items_quantity=[]
            list_items_details=[]
            list_items_checkedStatus=[]
            
            list_items_ids += [str(".")] # Used as delimiter
            list_items += [str(".")]
            list_items_quantity += [str(".")]
            list_items_details += [str(".")]
            list_items_checkedStatus += [str(".")]
            
            list_items_ids += [str(list_id)] # list id is added to items list for identification
            list_items += [str(list_id)]
            list_items_quantity += [str(list_id)]
            list_items_details += [str(list_id)]
            list_items_checkedStatus += [str(list_id)]
                
    
                
            # print "Getting updated list items for list " + str(list_id)
            try:
                # Get all user's updated items 
                items = self.getAllListItems(username, list_id)
            except:
                print "Failed getting updated list items for list " + str(list_id)
                return
            
            # This print type returns NoneType which means ther are no items at this point.
            #   This is the initial load when the dashboard first populates.
            
            # print items
            if items:
                print "Got " + str(len(items)) + " items"
                # Add each item to the list
                for item in items:
                    print str(item.item_name)
                    list_items_ids += [str(item.item_id)]
                    list_items += [str(item.item_name)]
                    list_items_quantity += [str(item.item_quantity)]
                    list_items_details += [str(item.item_details)]
                    list_items_checkedStatus += [str(item.checked_status)]
    
    
            return {
                'Ack': dbAck,
                'keyword': keyword,
                'list_ids': [list_id],
                'list_names': [views.get_list_name(list_id)],
                'list_items_ids': list_items_ids,
                'list_items': list_items,
                'list_items_quantity': list_items_quantity,
                'list_items_details': list_items_details,
                'list_items_checkedStatus': list_items_checkedStatus,
            }   
        else:
            return {
                'Ack': dbAck,
                'keyword': keyword,
                'list_ids': -1,
                'list_names': [],
                'list_items_ids': [],
                'list_items': [],
                'list_items_quantity': [],
                'list_items_details': [],
                'list_items_checkedStatus': [],
            }  
            
    
    # Returns updated records of specified list settings from the DB packaged for use by the dashboard
    def packageListSettings(self, username, list_id, dbAck, keyword):
        if dbAck != "Fail":
            list_users = []
            list_tags=[] 
            
            list_users += [str(".")] # Used as delimiter
            list_tags += [str(".")]

            list_users += [str(list_id)] # list id is added to items list for identification
            list_tags += [str(list_id)]
                
            # print "Getting updated list users for list " + str(list_id)
            
            # TODO
            #   This segment needs:
            #   self.getAllListUsers(username, list_id)
            #   self.getAllListTags(username, list_id)
            
            # # TESTING ONLY
            users = []
            tags = []
            
            try:
                l_users = views.get_users(list_id)
            
                for user in l_users:
                    users += [str(user.username)]
                    # print [user.username]
            except:
                print "Failed getting updated list items for list " + str(list_id)
                # return
            
           
                
            # l_tags = views.get_list_tags(list_id)
            
            # for t in l_tags:
            #     tags += t.tag_name
            
            
            
            
            
            # # print "Getting updated list tags for list " + str(list_id)
            # try:
            #     # Get all user's updated tags 
            #     # tags = self.getAllListTags(username, list_id)
            # except:
            #     print "Failed getting updated list items for list " + str(list_id)
            #     return
            
            
            # print users
            if users:
                print "Got " + str(len(users)) + " users"
                # Add each user to the list
                for user in users:
                    print str(user)
                    list_users += [str(user)]
                    
            # print tags
            if tags:
                print "Got " + str(len(tags)) + " tags"
                # Add each tag to the list
                for tag in tags:
                    print str(tag)
                    list_tags += [str(tag)]
    
    
            return {
                'Ack': dbAck,
                'keyword': keyword,
                'list_ids': [list_id],
                'list_users': [list_users],
                'list_tags': [list_tags],
            }   
        else:
            return {
                'Ack': dbAck,
                'keyword': keyword,
                'list_ids': -1,
                'list_users': [],
                'list_tags': [],
            } 
  
        
    #   Currently, these are only error checking these queries and making conveinant functions
    #   Error checking should be in views too, but truly not mandatory yet
    def getAllUsersLists(self, username):
        try:
            return views.get_user_lists(username)
        except Exception, e:
            print "Username could not be found in the database"
            print e
            return
        
    def getAllListItems(self, username, list_id):
        try:
            # for someList in views.get_list_items(views.get_list(list_id)):
            #     if someList:
            #         print someList
            
            return views.get_list_items(views.get_list(list_id))
        except Exception, e:
            print "List " + str(list_id) + " could not be found for user " + username
            print e
            return
        
    # Converts the timestamp from the client to a database worhty format
    # TODO
    #   A good implementation for use in a database needs to account for timezones too
    def convertTimestamp(self, timestamp):
        # Input format:
        #   4/21/2016 4:10:38 PM
        # Output (DB) format
        #   2016-04-21 04:10:38+00:00
        
        timestampComponents = timestamp.split(" ")
        
        # Reformat date
        date = timestampComponents[0].split("/")
        month = date[0]
        if int(month) < 10:
            month = "0" + month
        day = date[1]
        year = date[2]
        formattedDate = year + "-" + month + "-" + day
        
        # Reformat time
        time = timestampComponents[1]
        
        # TODO - Account for timezone
        time = time + "+00:00"
        
        # Reformat timestamp
        formattedTimestamp = formattedDate + " " + time
        print formattedTimestamp
        
        return ""
        
        
