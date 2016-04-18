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
            print "Unexpected request: "
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
        
        # Get all user's lists
        lists = self.getAllUsersLists(username)
        if lists:
            numLists = len(lists)
            # Loop through each list and populate attributes
            for x in range(0, numLists):
                list = lists[x]
                list_ids += [str(list.list_id)]
                list_names += [str(list.list_name)]
                list_items_ids += [str(".")] # Used as delimiter
                list_items += [str(".")]
                list_items_quantity += [str(".")]
                list_items_details += [str(".")]
                list_items_checkedStatus += [str(".")]
                
                list_items_ids += [str(list.list_id)] # list id is added to items list for identification
                list_items += [str(list.list_id)]
                list_items_quantity += [str(list.list_id)]
                list_items_details += [str(list.list_id)]
                list_items_checkedStatus += [str(list.list_id)]
                
                print ("Getting list " +  str(list.list_id) + " for user " + username)
                
                # Get all user's items 
                items = self.getAllListItems(username, x)
                if items:
                    # Add each item to the list
                    for item in items:
                        list_items_ids += [str(item.item_id)]
                        list_items += [str(item.item_name)]
                        list_items_quantity += [str(item.item_quantity)]
                        list_items_details += [str(item.item_details)]
                        list_items_checkedStatus += [str(item.checked_status)]
                else:
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
            return
        
    # Processes the edit list details requests
    def processEditDetailsRequest(self, request):
        # Containers
        list_id=str(request.GET.__getitem__('listID'))
        list_name=str(request.GET.__getitem__('listName'))
        list_items=request.GET.__getitem__('listItems')
        split_items = list_items.split('|')
        for item in split_items:
            item.split(',')
            print item

        list_items_ids=[] 
        list_items_quantity=[]
        list_items_details=[]
        list_items_checkedStatus=[]
        
        username = str(request.GET.__getitem__('username'))
        
        # Get list in DB with listI_id and username
        #   Comapare to see if different
        # Add new stuff to database
        #   Check if successful and store in dbAck
        tmpList = views.get_list(list_id)
        tmpListItems = views.get_list_items(tmpList)
        
        # DB ack - Was DB update successful? ("Success/Failed")
        dbAck = "Fail"
        #Changes the name of the list if the name is different when compared
        if tmpList.list_name != list_name:
            if views.title_edit(list_id,list_name) == 1:
                dbAck = "Success"
            else:
                dbAck = "Fail"
            
        #addd any items to the database/list that are not already in it
        for item in split_items:
            split_item = item.split(',')
            if split_item[0] == '-1':
                if views.create_item(username,list_name,split_item[1],'','') == 1:
                    dbAck = "Success"    
                else:
                    dbAck = "Fail"
        
        list_items = []
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
        
        print "Getting updated list items for list " + list_id
        # Get all user's updated items 
        items = self.getAllListItems(username, int(list_id))
        if items:
            # Add each item to the list
            for item in items:
                list_items_ids += [str(item.item_id)]
                list_items += [str(item.item_name)]
                list_items_quantity += [str(item.item_quantity)]
                list_items_details += [str(item.item_details)]
                list_items_checkedStatus += [str(item.checked_status)]
        
        return {
            'Ack': dbAck,
            'keyword': "ListDetailsEdit",
            'list_ids': [list_id],
            'list_names': [list_name],
            'list_items_ids': list_items_ids,
            'list_items': list_items,
            'list_items_quantity': list_items_quantity,
            'list_items_details': list_items_details,
            'list_items_checkedStatus': list_items_checkedStatus,
        }
    
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


    # Helper functions
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
            return views.get_list_items(views.get_user_lists(username)[list_id])
        except Exception, e:
            print "List " + list_id + " could not be found for user " + username
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
        
