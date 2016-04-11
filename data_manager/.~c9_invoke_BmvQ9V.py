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
    username=""
    lists=[]
    list_items = []
    list_ids=[]
    list_names=[]

    
    def getAllUsersLists(self, username):
        try:
            return views.get_user_lists(username)
        except Exception, e:
            print "Username could not be found in the database"
            return
        
    def getAllListItems(self, username, list_id):
        try:
            return views.get_list_items(views.get_user_lists(username)[list_id])
        except Exception, e:
            print "List " + list_id + "could not be found for user " + username
            return
    
    # Process and stores attributes found in request
    def process_request(self, request):

        # Extract request data 
        try:
            # Get the processing keyword
            keyword = str(request.GET.__getitem__('keyword'))
            
            # Initial population of the dashboard
            if keyword == "InitialLoad":
                # Get username for DB queries
                self.username = str(request.GET.__getitem__('username'))
                print self.username
                return json.dumps(self.initial_load())
            
            # Sync request
            if keyword == "Sync":
                # Get username for DB queries
                self.username = str(request.GET.__getitem__('username'))
                print self.username
                return json.dumps(self.sync())
                
        except Exception, e:
            print "Unexpected request: " + e
            
        return
        
    # getContext() is the function called when using a JQuery .get() call to this widget 
    #   (URL registered in grocerease/urls.py)    
    
    # TODO - This function should look similar to this
    # Stop putting all this shit in here
    # def get_context(self):
    # return {
    #             'list_ids': self.get_list_ids(),
    #             'list_names': self.get_list_names(),
    #             'list_items': self.get_list_items(),
    # }

    def initial_load(self):
        #  Clear structs
        self.lists=[]
        self.list_items = []
        self.list_ids=[]
        self.list_names=[]
        s
        # Get all user's lists
        self.lists = self.getAllUsersLists(self.username)
        if self.lists:
            numLists = len(self.lists)
            # Loop through each list and populate attributes
            for x in range(0, numLists):
                list = self.lists[x]
                self.list_ids += [str(list.list_id)]
                self.list_names += [str(list.list_name)]
                self.list_items += [str(".")] # Used as delimiter
                self.list_items += [str(list.list_id)] # list id is added to items list for identification
                
                print ("Getting list " +  str(list.list_id) + " for user " + self.username)
                
                # Get all user's items 
                items = self.getAllListItems(self.username, x)
                if items:
                    # Add each item to the list
                    for item in self.getAllListItems(self.username, x):
                        self.list_items += [str(item.item_name)]
                else:
                    return
            return {
                'list_ids': self.list_ids,
                'list_names': self.list_names,
                'list_items': self.list_items,
            }
        
        else:
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
        
