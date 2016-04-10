from django.http import HttpResponse            # typically replaced by render for less code
from django.http import Http404                 # 404 handling replaced by shortcut 
from django.shortcuts import get_object_or_404  # 404 handling shortcut
from django.shortcuts import render
from django.template import loader
from .models import lists #used for retrieving a users lists
from .models import items #used for retrieving a user's list's items
from .models import tags  #used for retrieving a user's tags
from django.contrib.auth.models import User 
import json #for intaking chris-formation
from django.http import HttpResponseRedirect


# Index View

# Simple string return
# def index(request):
#     return HttpResponse("You're at the data_manager index.")
    
# Using a template
def index(request):
    
    # Auth user for this page
    if request.user.is_authenticated():
       
        
    

    #####################
    # copy paste 4 life
    #####################
        if request.method == "POST":
            
            someRandString = "yo mama so frill" #filler, if statements cannot just be empty or it will BLECKLA in you
            #this is where you process incoming chris-formation
            #We agreed that this would be in JSON format SO you just need to json.loads(request.body)
            #this handles... INCOMING.. but how does he get to SEE stuff...
            #the answer: STILL POST :D
            
            DataSent = json.loads(request.body)#fuafuafuafuafuafuafuafuafuafuafuafuafua, fuafua, fuafuafuafua!!!
            
            #------------------------------------
            #----For Incoming Chris-Formation----
            #------------------------------------
            
            
            #we need to have a little flag in the array input to decide if you are trying to SEND me stuff or ASK for stuff
            
            if DataSent["direction"] == "IN": #this needs to be implemented in chris-town
                someRandString = "yo mama so frill" #filler, if statements cannot just be empty or it will BLECKLA in you
            
            
            DataSent["data"]
            request.user.name
            
            
            #DataSent{
            
            # 
            
            #   direction:"in",
            
            #   joker:True
            
            #
            #   data{
            #       list_id:4
            #       edits{
            #           43:"Carrots"
            #           46:"Grapes"
            #   timestamp
            #       checked{
            #           26:True
            #           77:False
            
            #
            
            
            
            
            
            #------------------------------------
            #----For Outgoing Chris-Formation----
            #------------------------------------
            if DataSent["direction"] == "OUT":
                someRandString = "yo mama so frill" #filler, if statements cannot just be empty or it will BLECKLA in you
                
                #using a field like "DataSent["user"]" you should be able to construct a packet of entirely user-specific data and..
                
                #DataSent{
                #   direction:"out",
                #   type:"update"/"download"
                #   data{
                #       list_id{
                #           4,
                #           9
                #       
                #   timestamp
                #   
                
                
                
                #ToSend{
                #   type:"update"
                #   data{
                #       list4{
                #           43:"Carrots"
                #           46:"Grapes"
                #           checked{
                #               26:True
                #               77:False
                #   timestamp
                
                
                
                #ToSend{
                #   type:"download"
                #   data{
                #       list4{
                #           1:"turtles",
                #           2:
                #           3:
                #           4:
                #           checked{
                #               1:
                #               2:
                #               3:
                #               4:
                #       list9{
                #   timestamp
                
                
                
                
                
                
                
                
                responseText = "some response array of info" #make sure this is compatable with SWIFT datatypes...
                return json.dumps(responseText)
            
            
            
            
            
            
            
        else:
        # Just trying to talk shit to another page
            someRandString = "yo mama so frill"
            context = {'randomText': someRandString}
            # return render(request, 'lists/index.html', context)
            
            
            return render(request, 'dashing/dashboard.html', context) #junk
        
    
    
    
    # Explicit version of the shortcut above
        # someRandString = "yo mama so phat"
        # template = loader.get_template('lists/index.html')
        # context = {'randomText': someRandString}
        # return HttpResponse(template.render(context, request))
    

    
    # Index page working with DB example
        # latest_object_list = ListDBObject.objects.order_by('-pub_date')[:5]
        # template = loader.get_template('appName/index.html')
        # context = {
        #     'nameForUseInHTMLFile': latest_object_list,
        # }
        
    else:
        return redirect('accounts/login', request) #omg unique and unknown 


#############
#Author: Abel Trespalacios
#Date Created: 3/5/16
# The below views are used for retreiving a particular user's lists, and those list's items
# this is otherwise known as 'commissary module'. Also, tags will be retrieved


#These functions have been made quickly and terribly in order to meet deadline.
#More error handling needs to be done and they need to be properly placed wherever they need to go
#I obviously know nothing about best practices for Django, so someone who does should deal with it.
#############


#------List operations----------------------------------------------------------
#Function that retrieves a given user's created lists
#needs user form for receiving and list form for sending?
def get_user_lists(user_name):
     users_lists = []
     user = User.objects.get(username = user_name)
     users_lists = user.users_lists.all()
     
     if not users_lists:
        return "User currently has no lists!"
     else:
        return users_lists
      
#function that creates a list for a particular user
def create_list(user_name, new_list_name):
    user = User.objects.get(username = user_name)
    if not user:
        return "Error, user does not exist!"
    else:
        new_list = lists(list_name = new_list_name, is_premade = 0, list_creator_id = user.id)
        new_list.save()
        new_list.list_users.add(user)
        return "List %s successfully created for user %s." % (new_list_name,user.username)
    
    
def update_list(user_name, list_id, content): #so you should ALWAYS reference existing objects by their UNIQUE ID generated by django(or you?)
    
    lEdit = lists.objects.filter(list_id=list_id) #should be utterly unique if django generated OR I hate you, AYE WANNA FIGHT
    if user_name in lEdit.list_users:
        someRandString = "yo mama so frill" #filler, statements cannot just be empty or it will BLECKLA in you
        #do the edits 'lEdit' is list to be Edited
    else:
        someRandString = "yo mama so frill" #filler, statements cannot just be empty or it will BLECKLA in you
        #u r'ent allowed so fuck off
        
            
# #function that leaves a list for a particular user
#"leave list" refers to removing an 'access' aka deleting, once all users have 'left' a list the list will be purged
def leave_list(leaving_user, name_of_list):
    user = User.objects.get(username = leaving_user)
    list_to_leave = user.users_lists.get(list_name = name_of_list)
    
    if not list_to_leave:
        return "The user is not a part of this list!"
    
    list_to_leave.list_users.remove(user)
    return "User has successfully left the list"
    
#function that retrieves site's premade lists based on tag
#NEEDS TESTING
# def get_premade_lists(tag): #tag can be null if all premade lists are wanted
#     premade_lists = []
#     if not tag:
#         premade_lists = lists.objects.filter(is_premade = 1)
        
#         if not premade_lists:
#             return "There are no premade lists!"
#         else:
#             return premade_lists
#     else:
#         premade_lists = lists.objects.filter(lists_tags = tag, is_premade = 1)
        
#         if not premade_lists:
#             return "There are no premade lists containing the given tags!"
#         else:
#             return premade_lists
            

#------Item operations----------------------------------------------------------

#function that retrieves a single list's items      
def get_list_items(user_list):
     list_items = items.objects.filter(containing_list_id = user_list.list_id)
     
     if not list_items:
         return "The list has no items!"
    
     else: #it's like that game where you try to paint things ur color
         return list_items
         
#function that creates an item for a user's list
def create_item(user_name, containing_list_name, new_item_name, details, quantity):
    user = User.objects.get(username = user_name)
    containing_list = lists.objects.get(list_name = containing_list_name)
    
    if not containing_list and not user:
        return "Error, the user and list both do not exist!"
    
    else:
        new_item = items(item_name = new_item_name, checked_status = 0, item_details = details, 
                     item_quantity = quantity,containing_list_id = containing_list.list_id, item_creator_id = user.id)
        new_item.save()
        return "Item %s successfully created in list %s for user %s" % (new_item_name, containing_list_name, user_name)
    
#function that deletes an item from a specified list
#NEEDS TESTING
# def delete_item(containing_list, item):
#     containing_list = lists.objects.get(list_name = containing_list)
#     item_to_delete = items.objects.get(item_name = item)
    
#     if not containing_list and item_to_delete:
#         return "List and item does not exist!"
        
#     else:
#         if item_to_delete.containing_list_id == containing_list.list_id:
#             item_to_delete.delete()
#             return "Item %s successfully deleted from %s" % (item, containing_list)
#         else:
#             return "Some error about how the item could not be deleted"
        
            
        
    
#------Tag operations-----------------------------------------------------------
#function that retieves a user's tags
def get_user_tags(user_name):
     users_tags = []
     user = User.objects.get(username = user_name)
     users_tags = tags.objects.filter(tag_creator_id = user.id)
     return users_tags
     
#------Product Operations-------------------------------------------------------
#function that gathers all of the a particular stores products
#NEEDS TESTING
# def get_stores_products(name_of_store):
#     stores_products = []
#     store = stores.objects.get(store_name = name_of_store)
#     stores_products = store.stores_products.all()
    
#     if not stores_products:
#         return "Store has no products!"
        
#     else:
#         return stores_products
        
#function that makes a newly entered item a product
#honestly not sure how this is gonna be done...can worry about later
#def item_to_product(new_item):
    
