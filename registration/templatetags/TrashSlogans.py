import random
from django import template

register = template.Library()


@register.simple_tag
def makePhrase():
    slogans = ["Trash free since '83", "Fun begins without Trash", "If anyone can't, Trash can't", "The worst Trash on this planet"]
    slogans += ["Trash keeps coming!","Trash, enjoy the present.","Trash is easy, it's fun too!", "See what we mean. Trash."]

    return random.choice(slogans)