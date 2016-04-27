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
    # username=""
    # lists=[]
    # list_ids=[]
    # list_names=[]
    # list_items_ids=[]
    # list_items=[]
    # list_items_quantity=[]
    # list_items_details=[]
    # list_items_checkedStatus=[]
    
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
                    
                    # List id will preceed the attributes for that list in their containers
                    list_items_ids += [str(list1.list_id)] 
                    list_items += [str(list1.list_id)]
                    list_items_quantity += [str(list1.list_id)]
                    list_items_details += [str(list1.list_id)]
                    list_items_checkedStatus += [str(list1.list_id)]
                    
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
                                print "Could not get items for packaging"
                    else:
                        print "Could not get items for packaging"
                        return
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
            }
        else:
            print "Could not get users lists for client initial info population response "
            return
        
    # Processes the edit list details requests
    def processEditDetailsRequest(self, request):
        # Vars
        list_id=str(request.GET.__getitem__('listID'))
        list_name=str(request.GET.__getitem__('listName'))
        list_items=request.GET.__getitem__('listItems')
        print list_items
        username = str(request.GET.__getitem__('username'))
        dbAck = "Fail" # DB ack - Was DB update successful? ("Success/Fail")
        
        
        # Get list in DB with listI_id and username
        #   Comapare to see if different
        # Add new stuff to database
        #   Check if successful and store in dbAck
        
        # If new list, add to db and retreive id

        print list_id
        if list_id == str(-1):
            list_id = views.create_list(username, list_name)
            
        tmpList = views.get_list(list_id)
                
        #     try:

        #     except:
        #         print "Couldn't get list"

        try:    
            # tmpListItems = views.get_list_items(tmpList)
    
            
            # Changes the name of the list if the name is different when compared
            if tmpList.list_name != list_name:
                if views.title_edit(list_id,list_name) == 1:
                    dbAck = "Success"
                else:
                    print "Title edit failed"
                    dbAck = "Fail"

            split_items = list_items.split('|')
            for item in split_items:
                item.split(',')
                # print item        
                
            # Add any items to the database/list that are not already in it
            for item in split_items:
                split_item = item.split(',')
                if split_item[0] == '-1':
                    
                    # TODO 
                    # Things are failing here....
                    if views.create_item(username,list_name,split_item[1],'','') == 1:
                        dbAck = "Success"    
                    else:
                        print "Item creation failed"
                        dbAck = "Fail"
        except:
            print "Exception!!!"

        print "Packaging edit list ack"
    def processEditSettingsRequest(self, request):
    
    
    #NEEDS TESTING
    # Process the edit list settings requests: add/remove users, add/remove tags
    def processEditSettingsRequest(self, request):
        # Get the username
        username = str(request.GET.__getitem__('username'))
        print username
        # Get the listId
        listId = str(request.GET.__getitem__('listID'))
        print listId
        
        # Get the user's user_ids associated with the list
        userIds = str(request.GET.__getitem__('listUsers'))
        print userIds
        
        # Get the lists tags, NOTE: same format as items [id,tag_name], also split the same way 
        tags = str(request.GET.__getitem__('listTags'))
        print tags
     
        #Should be able to split tags the same way we split items
        split_tags = tags.split('|')
        for t in split_tags:
            t.split(',')
            print t
            
        dbAck = "Fail"
        #TODO: Add and/or remove any users to and/or from the list
        tmpList = views.get_list(listId)
        
        
        #users add/remove
        for user in userIds:
            if not tmpList.list_users.get(id = user):
                if views.add_user(listId,user) == 1:
                    dbAck = "Success"
                else:
                    dbAck = "Fail"
            
            elif tmpList.list_users.get(id = user):
                if views.remove_user(listId,user) == 1:
                    dbAck = "Success"
                else:
                    dbAck = "Fail"
        
        #Tags add/remove
        for tag in split_tags:
            split_tag = tag.split(',')
            
            if split_tag[0] == '-1':
                if views.add_tag(listId,username,split_tag[1]) == 1:
                    dbAck = "Success"
                else:
                    dbAck = "Fail"
            
            if tmpList.list_tags(tag_id = int(split_tag[0])):
                if views.remove_tag(listId,split_tag[1]) == 1:
                    dbAck = "Success"
                else:
                    dbAck = "Fail"
                
        return {
            # 'list_ids': self.list_ids,
            'Ack': "I got your shit yo",        
        }
        
    # Process sync requests
    def processSyncRequest(self, request):
        # Get the username
        username = str(request.GET.__getitem__('username'))
        print username
        # Get the listId
        listId = str(request.GET.__getitem__('listID'))
        print listId
        # Get the title
        name = str(request.GET.__getitem__('listName'))
        print name
        # Get the items
        listItems = str(request.GET.__getitem__('listItems'))
        print listItems

        return {
            # 'list_ids': self.list_ids,
            'Ack': "I got your shit yo",        
        }
        
    # Process the add list requests
    def processAddListRequest(self, request):
        # Get the username
        username = str(request.GET.__getitem__('username'))
        print username
        # Get the userid
        userid = str(request.GET.__getitem__('userid'))
        print userid
        
        # Get the list_id
        list_id = str(request.GET.__getitem__('listID'))
        print list_id
        # Get the title
        name = str(request.GET.__getitem__('listName'))
        print name
        # Get the items
        listItems = str(request.GET.__getitem__('listItems'))
        print listItems

        return  {'Ack': dbAck,
            'keyword': "AddListRequest",
            'list_ids': [list_id],
            'list_names': [views.get_list_name(list_id)],
            'list_items_ids': list_items_ids,
            }
        # return packageListDetails(usernaem, list_id, dbAck, "AddListRequest")


    # Helper functions
    
    # Returns updated records of specified list details from the DB packaged for use by the dashboard
    def packageListDetails(self, username, list_id, dbAck, keyword):
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
            

            
        print "Getting updated list items for list " + str(list_id)
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
                # print item.type()
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
        
# class LiveListWidget(Widget):
#     dashboardHelper = DashboardHelper()
#     title = ''
#     more_info = ''
#     updated_at = ''
    

#     # Keeps lists information updated
#     def getUpdates(self):
    
    
#         # Getting the hamburger list 
#         #   this will currently append the items to the already retreived items
#         #   obviously not good and I need to get with Kevin to discuss how we are managing the sync
#         username = 'test'
#         lists = self.dashboardHelper.getAllUsersLists(username)
#         # lists = views.get_user_lists(username)
#         # self.title = lists[0].list_name
#         items = self.dashboardHelper.getAllListItems(username, list_id)
#         for item in items:
#             self.itemLabels += [str(item)]  # add item to widget itemsData array
        


#     # This is called on a specified schedule, thus it uses the sync method to
#     #   minimize the data we are grabbing for every call
#     def get_context(self):
#         self.getUpdates()
#         # print self.itemsData
#         return {
#             'title': self.title,
#             'moreInfo': self.more_info,
#             'updatedAt': self.updated_at,
#             'itemsData': self.itemLabels,
#         }
        
