from django.http import HttpResponse            # typically replaced by render for less code
from django.http import Http404                 # 404 handling replaced by shortcut 
from django.shortcuts import get_object_or_404  # 404 handling shortcut
from django.shortcuts import render, redirect
from django.template import loader
from .models import lists #used for retrieving a users lists
from .models import items #used for retrieving a user's list's items
from .models import tags  #used for retrieving a user's tags
from .models import products
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
            
            DataSent = json.loads(request.body)
            
            #------------------------------------
            #----For Incoming Chris-Formation----
            #------------------------------------
            
            
            #we need to have a little flag in the array input to decide if you are trying to SEND me stuff or ASK for stuff
            
            #if DataSent["direction"] == "IN": #this needs to be implemented in chris-town
                #someRandString = "yo mama so frill" #filler, if statements cannot just be empty or it will BLECKLA in you
            
            
            #DataSent["data"]
            #request.user.name
            
            
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
            #if DataSent["direction"] == "OUT":
                #someRandString = "yo mama so frill" #filler, if statements cannot just be empty or it will BLECKLA in you
                
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
                
                
                
                
                
                
                
                
            responseText = "Post received: " #make sure this is compatable with SWIFT datatypes...
            return json.dumps(responseText + DataSent)
            
            
            
            
            
            
            
        # else:
        # # Just trying to talk shit to another page
        #     someRandString = "yo mama so frill"
        #     context = {'randomText': someRandString}
        #     # return render(request, 'lists/index.html', context)
            
            
        # return render(request, 'dashing/dashboard.html', context) #junk
        
    
    
    
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




#----------------------------------------------------------------------------------------
#--------------------------------------THE GEN PAGE--------------------------------------
#----------------------------------------------------------------------------------------

def gen(request):
    #major debug page
    context = {'productCount': products.objects.count(), 'listCount': lists.objects.count(), 'itemCount': items.objects.count(), 'mylists': lists.objects.filter(list_creator_id = request.user.id).count()}
    u
    context['userList'] = users.objects.all()
    if request.method == 'POST':
        if 'purge_products' in request.POST:
            context['message'] = "PRODUCTS PURGED" #placeholder
            for p in products.objects.all():
                p.delete()
    
        
    return render(request, 'gen.html',context)

#---------------------------------------------------------------------------------------
#------------------------------------Debugging et al------------------------------------
#---------------------------------------------------------------------------------------










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
# Get list name
def get_list_name(list_id):
    return get_list(list_id).list_name;
    
    
#Function that retrieves a given user's created lists
#needs user form for receiving and list form for sending
def get_user_lists(user_name):
     users_lists = []
     user = User.objects.get(username = user_name)
    
     #TODO: But like actually fix this at some point in the future lol
     users_lists = user.users_lists.all()
     #users_lists = lists.objects.filter(list_creator_id = user.id)
     #fix #collaboration
     
     
     if not users_lists:
        return "User currently has no lists!"
     else:
        return users_lists
        
#obtains a list from the database
def get_list(l_id):
    try:
        return lists.objects.get(list_id = l_id)
    except:
        # print l_id
        print "Couldn't get_list()"
        return 
    
#function that creates a list for a particular user
def create_list(user_name, new_list_name):
    print "Create list called"
    user = User.objects.get(username = user_name)
    if not user:
        return "Error, user does not exist!"
    else:
        try:
            new_list = lists(list_name = new_list_name, is_premade = 0, list_creator_id = user.id)
            new_list.save()
            new_list.list_users.add(user)
            new_list.save()
            print "List %s %s successfully created for user %s." % (new_list_name,new_list.list_id, user.username)
            return new_list.list_id
        except Exception, e:
            print "Create list fucked up"
            print e
    
#changes the list title to the passed in new list title
def title_edit(l_id,new_title):
    tmp_l = lists.objects.get(list_id = l_id)
    tmp_l.list_name = new_title
    tmp_l.save()

    if tmp_l.list_name == new_title:
        return 1
    else:
        return 0
   
# def update_list(user_name, list_id, content): #so you should ALWAYS reference existing objects by their UNIQUE ID generated by django(or you?)
    
#     lEdit = lists.objects.filter(list_id=list_id) #should be utterly unique if django generated OR I hate you, AYE WANNA FIGHT
#     if user_name in lEdit.list_users:
#         someRandString = "yo mama so frill" #filler, statements cannot just be empty or it will BLECKLA in you
#         #do the edits 'lEdit' is list to be Edited
#     else:
#         someRandString = "yo mama so frill" #filler, statements cannot just be empty or it will BLECKLA in you
#         #u r'ent allowed so fuck off
        
        
        
#function that edits a particular piece of a user's list, essentially a sync utility function
'''this function will take in a user name (the name of the user who's list is being edited), and
   an array containing all of the information of the list wanting to be edited. This information will
   be compared to the actual list in the database and update whatever is different between the two.'''
   
# def edit_list(a, username, e_list_info = []):
#     #gather information needing to be edited
#     e_list_id = e_list_info[0]
#     e_list_name = e_list_info[1]
#     tags_list = e_list_info[2]
#     list_users = e_list_info[3]
    
    
#     list_to_change = lists.objects.get(list_id = e_list_id)
#     curr_tags = list_to_change.list_tags.all()
#     curr_users = list_to_change.list_users.all()
#     curr_items = get_list_items(list_to_change)
   
    # #modifiers
    # if a == 'title':
    #     #list title
    #     if list_to_change.list_name != e_list_name:
    #         list_to_change.update(list_name = e_list_name)
    #         list_to_change.save()
    
    # elif a == 'itemdel':
    #     #delete an item from a list, 
    # #TODO: Figure out how the fuck this works
    
    
# #settings
#     #update tags
#     for i in tags_list:
#         add_tag(e_list_id,list_to_change.list_creator,i)
        
#     #update users
#   # for i in list_users:
        
            
        
    





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
            

def get_timestamp(l_id):
    l = lists.objects.get(list_id = l_id)
    return l.updated_on

#------User Operations----------------------------------------------------------
#The follwoing user operations need testing
#function that retrieves a specific list's users
def get_users(l_id):
    tmp_l = lists.objects.get(list_id = l_id)
    return tmp_l.list_users.all()

#function that adds a user to a certain list
def add_user(l_id, u_id):
    tmp_l = lists.objects.get(list_id = l_id)
    tmp_u = User.objects.get(id = u_id)
    tmp_l.list_users.add(tmp_u)
    tmp_l.save()
    
    if tmp_l.list_users.get(id = tmp_u.id):
        return 1
    else:
        return 0
    
    
#function that removes a user from a certain list
def remove_user(l_id, u_id):
    tmp_l = lists.objects.get(list_id = l_id)
    tmp_u = User.objects.get(id = u_id)
    tmp_l.list_users.remove(tmp_u)
    tmp_l.save()

    if not tmp_l.list_users.get(id = tmp_u.id):
        return 1
    else:
        return 0
#------Item operations----------------------------------------------------------

#function that retrieves a single list's items      
def get_list_items(user_list):

    list_items = items.objects.filter(containing_list_id = user_list.list_id)
    
    if not list_items:
        print "The list has no items!"
        return 
    
    else:
        # print list_items
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
        
        if new_item:
            return 1
        else:
            return 0
    
#function that deletes an item from a specified list
#NEEDS TESTING
def remove_item(containing_list, i): #i is id or whatever
    #containing_list = lists.objects.get(list_name = containing_list)
    
    if items.objects.filter(item_id = i).delete():
        return 1
    else:
        return 0

#------Tag operations-----------------------------------------------------------
#function that retieves a user's tags
# def get_user_tags(user_name):
#      users_tags = []
#      user = User.objects.get(username = user_name)
#      users_tags = tags.objects.filter(tag_creator_id = user.id)
#      return users_tags
     
#add a tag to a list, vice versa
def add_tag(l_id, creator, t):
    t_creator = User.objects.get(username = creator)
    
    #if the tag is already a thing, simply associate it with the list
    if tags.objects.filter(tag_name = t).exists() == True:
        tmp_t = tags.objects.get(tag_name = t)
        tmp_l = lists.objects.get(list_id = l_id)
        tmp_l.list_tags.add(tmp_t)
        tmp_l.save()
        
        if tmp_l.list_tags.get(tag_id = tmp_t.tag_id):
            return 1
        else:
            return 0
            
    else:
        #create the tag and then associate it with the list
        new_tag = tags(tag_name = t, tag_details = '', tag_creator = t_creator.id)
        new_tag.save()
        tmp_l = lists.objects.get(list_id = l_id)
        fresh_tag = tags.objects.get(tag_name = t)
        tmp_l.list_tags.add(fresh_tag)
        tmp_l.save()
        
        if tmp_t.list_tags.get(tag_id = fresh_tag.tag_id):
            return 1
        else:
            return 0
        
#remove a tag from a specific list
def remove_tag(l_id, t):
    tmp_l = lists.objects.get(list_id = l_id)
    tmp_t = tags.objects.get(tag_name = t)
    tmp_l.list_tags.remove(tmp_t)

    if not tmp_l.list_tags.get(tag_id = tmp_t.tag_id):
        return 1
    else:
        return 0
    
    
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