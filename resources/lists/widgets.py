# Dashing widget for lists

# -*- encoding: utf-8 -*-
from django.db.models import Count
from django.conf import settings

from dashing.widgets import NumberWidget, ListWidget, GraphWidget

from random import randint

numLists = randint(5, 25)

class ListCounterWidget(NumberWidget):
    title = 'Total Lists'

    def get_value(self):
    	global numLists
    	numLists += 1
        return numLists
        
    def get_detail(self):
    	global numLists
        return '{} actives'.format(numLists/3)

    def get_more_info(self):
    	global numLists
        return '{} fakes'.format(numLists/10)
        


# class LiveListWidget(ListWidget):
#     title = ''
#     more_info = ''
#     updated_at = ''
#     data = []

#     def get_title(self):
#         return self.title

#     def get_more_info(self):
#         return self.more_info

#     def get_updated_at(self):
#         return self.updated_at

#     def get_data(self):
#         return self.data

#     def get_context(self):
#         return {
#             'title': self.get_title(),
#             'moreInfo': self.get_more_info(),
#             'updatedAt': self.get_updated_at(),
#             'data': self.get_data(),
#         }