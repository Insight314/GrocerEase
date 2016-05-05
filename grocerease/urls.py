"""grocerease URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin

# Dashing uses its own router to generate urls
from dashing.utils import router
# from data_manager import views

# Custom Lists Widget if not defined within dashing
# Widgets accessed this way are defined within the specified apps widgets.py file

# This is how to generate urls for widgets defined in data_manager widgets
from data_manager.widgets import DashboardHelper # LiveListWidget
    # This is how to generate urls for widgets defined in dashing widgets
    # from dashing.widgets import LiveListWidget

admin.autodiscover() #omg wtf forgot this line that is why some names didn't route
# Generates the url from root dashboard (/) currently
# router.register(LiveListWidget, 'live_list_widget')   # /widgets/live_list_widget, base list widget
router.register(DashboardHelper, 'dashboard_helper')  # /widgets/dashboard_helper, widget utilities used by dashing config

# Manual URL definitions
urlpatterns = [
   # url(r'^lists/', include('lists.urls')), # Should be removed after being used for reference
    url(r'^admin/', admin.site.urls),
    url(r'^accounts/', include('registration.backends.simple.urls')),
    url(r'^', include(router.urls)),
    url(r'^data_manager/', include('data_manager.urls', namespace='data')),
]