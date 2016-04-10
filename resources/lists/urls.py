from django.conf.urls import url

from . import views

app_name = 'lists'
urlpatterns = [
    
    # example: /lists/
    url(r'^$', views.index, name='index'),
    
    
    # Waiting for DB
    
    # # example: /lists/5/
    # url(r'^(?P<list_id>[0-9]+)/$', views.items, name='items'),
    
    # # example: /polls/5/details/
    # url(r'^(?P<question_id>[0-9]+)/details/$', views.details, name='details'),
    
]