# -*- encoding: utf-8 -*-
from django.views.generic import TemplateView
from django.core.exceptions import PermissionDenied
from django.shortcuts import render_to_response, render, redirect, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponse
from django.http import HttpResponseRedirect

from dashing.settings import dashing_settings


class Dashboard(TemplateView):
    template_name = 'dashing/dashboard.html'
    permission_classes = dashing_settings.PERMISSION_CLASSES

    def check_permissions(self, request):
        """
        Check if the request should be permitted.
        Raises an appropriate exception if the request is not permitted.
        """
        permissions = [permission() for permission in self.permission_classes]
        for permission in permissions:
            if not permission.has_permission(request):
                raise PermissionDenied()

    def get(self, request, *args, **kwargs):
        self.check_permissions(request)
        
        if request.user.is_authenticated():
            return super(Dashboard, self).get(request, *args, **kwargs)
        else:
            return redirect('accounts/login', request)
        
    # def post(self, request, *args, **kwargs):
    #     self.check_permissions(request)
        
    #     if request.user.is_authenticated():
    #         return super(Dashboard, self).post(request, *args, **kwargs)
    #     else:
    #         return redirect('accounts/login', request)