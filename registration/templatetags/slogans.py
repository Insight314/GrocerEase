import random
from django import template

register = template.Library()


@register.simple_tag
def makePhrase():
    slogans = ["The best GrocerEase on this planet.", "People Rule!", "The Human friendly GrocerEase.", "We're serious about GrocerEase."]
    slogans += [ "Have it your way.", "Make room for the GrocerEase.", " Get up and go.", "Think Small."]
    slogans += [ "Only GrocerEase has the Answer.", "Takes the waiting out of wanting.", " The power to do more."]
    slogans += [ "The Age of GrocerEase.", " Simple, Streamlined, Savory.", "A million holidays. One GrocerEase."]
    slogans += [ "For Inner Cleanliness.", "And it looks great!", "Comes with a smile.", "Think Fast, GrocerEase.", "Made simple."]
    slogans += [ "Means Life is BETTER :-)", "The Age of GrocerEase.", "Think globally act locally.", "Because life's complicated enough."]
    slogans += [ "Imagine that.", "Simply the best there is.", "No one can stop GrocerEase.", "Quality never goes out of style."]
    slogans += [ "Come to life. Come to GroceEase.","A pun on groceries.","Formerly TAFFEE: formerly Feed Me","404 Slogan Not Found"]
    slogans += []

    return random.choice(slogans)