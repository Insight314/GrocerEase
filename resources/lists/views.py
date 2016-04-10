from django.http import HttpResponse            # typically replaced by render for less code
from django.http import Http404                 # 404 handling replaced by shortcut 
from django.shortcuts import get_object_or_404  # 404 handling shortcut
from django.shortcuts import render
from django.template import loader

# Will use when using the lists for page functionality
#from .models import List
#from .models import ListItems 



# List Index View

# Simple string return
# def index(request):
#     return HttpResponse("You're at the lists index.")
    
# Using a template
def index(request):
    
    # Auth user for this page
    #if request.user.is_authenticated():
    # something    
        
    
    
    #####################
    # This will need to be sealed off. Currently we can bypass the login page with a request to /lists
    #####################
    
    # Just trying to talk shit to another page
    someRandString = "yo mama so phat"
    context = {'randomText': someRandString}
    # return render(request, 'lists/index.html', context)
    
    return render(request, 'dashing/dashboard.html', context)
    
    
    
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
        



#############
# The below views can be ued once the DB and lists schema is defined
#############

# List Items View

# def items(request, list_id): # list_id is defined in lists/urls.py ARG MUST BE THE PRIMARY KEY
#     list = get_object_or_404(List, pk=list_id)  # ensure arg is the primary key
#     context = { 'list': list }
#     # Explicit version of above shortcut
#         # try:
#         #     list = Lists.objects.get(pk=list_id)
#         #     context = { 'list': list }
#         # except List.objects.DoesNotExist:
#         #     raise Http404("List does not exist")
#     return render(request, 'lists/itemsIndex.html', context)



# List Details View

# def details(request, list_id):
#     list = get_object_or_404(List, pk=list_id)  # ensure arg is the primary key
#     context = { 'list': list }
#     # Can put more detailed info in this func
#     return render(request, 'lists/details.html', context)