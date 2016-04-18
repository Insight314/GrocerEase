from django.conf.urls import url

from . import views

app_name = 'data_manager'
urlpatterns = [
    
    # example: /data_manager/
    url(r'^$', views.index, name='index'),
    url(r'^gen/$', views.gen, name='gen'),
    
    
    
    
    # Waiting for DB
    
    # # example: /data_manager/5/
    # url(r'^(?P<list_id>[0-9]+)/$', views.items, name='items'),
    
    # # example: /data_manager/5/details/
    # url(r'^(?P<question_id>[0-9]+)/details/$', views.details, name='details'),
    
]