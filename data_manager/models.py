#encoding=utf8
from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

#Author: Abel Trespalacios
#Date Created: 2/1/16
#ORM of grocerease_db

'''---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  Table containing tags for lists
 
    Have:
        Django Built-in:
 		    creation date
 		    
	On Generation:
	    tag_id: id given to identify the tag 
        tag_creator (FK): creator of tag is assigned when created
        tag_name: name of the tag 
        tag_details: Any details about the tag that is created
'''
class tags(models.Model):
    tag_id = models.AutoField(primary_key = True)
    tag_name = models.CharField(max_length = 32)
    tag_details = models.TextField(max_length = 128)
    tag_creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name = 'tag_creator')
    
    def __str__(self):              # __unicode__ on Python 2
        return self.tag_name

    class Meta:
        ordering = ('tag_name',)
        verbose_name = ('Tag')
        verbose_name_plural = ('Tags')
  

'''---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  Table containing all lists.
  Each list has many items and users (lists with no users are purged…)

    Have:
        Django Built-in:
 		    creation date
 		    
 	    is_premade(boolean): will determine if list in table is a premade one to view
 	   
	On Generation:
	    list_id: id given to identify the list 
        list_creator (FK): creator of list is assigned when created
        list_type: creator of list assigns list type when created
        list_title: creator of list assigns a title to the list when created
'''
class lists(models.Model):
    list_name = models.CharField(max_length = 128)
    list_id = models.AutoField(primary_key = True)
    list_tags = models.ManyToManyField(tags, related_name = 'lists_tags')
    list_users = models.ManyToManyField(User, related_name = 'users_lists')
    list_creator = models.ForeignKey(User,on_delete=models.CASCADE, related_name = 'list_creator')
    is_premade = models.BooleanField(default = 0)
    
    def __str__(self):              # __unicode__ on Python 2
        return self.list_name

    class Meta:
        ordering = ('list_name',)
        verbose_name = ('List')
        verbose_name_plural = ('Lists')


'''---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Table containing addresses for each store
  
'''
class addresses(models.Model):
    address_id = models.AutoField(primary_key = True)
    street_name = models.CharField(max_length = 128)
    city_name = models.CharField(max_length = 30)
    state_code = models.CharField(max_length = 2)
    zip_code = models.CharField(max_length = 5)
    
    def __str__(self):              # __unicode__ on Python 2
        return self.address_id

    class Meta:
        ordering = ('address_id',)
        verbose_name = ('Store Address')
        verbose_name_plural = ('Store Addresses')
    
'''---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|  
  Table containing information about the stores that will have products
  Many stores can have many products
   
    Have:
        Django Built-in:
 	        creation date
	
	    On Generation:
	        store_name: The name of the store, with which products are associated with.
	        store_address: Address info about the stores
	        Optional: store_details: any extra details associated with the store
	        phone_number/regex: The stores phone number information, along with format validation
	        store_id: id generated to associate a particular store with particular products
 '''   
class stores(models.Model):
    store_id = models.AutoField(primary_key = True)
    store_name = models.CharField(max_length = 128)
    store_address = models.ManyToManyField(addresses, related_name = 'stores_addresses')
    store_details = models.TextField(max_length = 256)
    store_number = models.CharField(max_length = 15)
    
    def __str__(self):              # __unicode__ on Python 2
        return self.store_name

    class Meta:
        ordering = ('store_name',)
        verbose_name = ('Store')
        verbose_name_plural = ('Stores')

'''---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  Table containing the OG registered product
  Products have many similar items. 
   
  Note about generation of frequently referenced items:
   
  Products will sometimes be generated from high-frequency Items in the database that aren’t already tied to a Product.. 
  say a lot of users decide to shop for the earlier mentioned “Sulfuric Acid”.. we will then generate a Product that ties all of these together. 
  Later, the Inquisitor module will try to get information on HOW to obtain this… including Amazon!!

  
    Have:
        Django Built-in:
 	        creation date
	
	    On Generation:
	        product_name: The name of the definitive product, with which items are associated/compared to
	        Optional: product_details: Information about the product
	        product_price: The price of the product, to be gathered by Inquisitor somehow...
	        product_availability: boolean field for whether or not this item is available in one or any of the associated stores, gathered by Inquisitor somehow
'''
class products(models.Model):
    product_id = models.AutoField(primary_key = True)
    product_name = models.CharField(max_length = 128)
    product_price = models.DecimalField(max_digits=6, decimal_places=2)
    product_availability = models.BooleanField(default = 1)
    product_details = models.TextField(max_length = 256)
    store = models.ManyToManyField(stores, related_name = 'stores_products')
    
    def __str__(self):              # __unicode__ on Python 2
        return self.product_name

    class Meta:
        ordering = ('product_name',)
        verbose_name = ('Product')
        verbose_name_plural = ('Products')
      
'''---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
  Table containing items added by users.
  Each item is associated with a single registered product
  Sometimes… what if they type an item not in our products yet? or not sold in stores?? like… say they add “Sulfuric Acid”.. but we don’t generally support pricing on that yet…

    Have:
        Django Built-in:
 		    creation date
	
	On Generation:
	    item_name: Name of item is assigned by user on creation
	    item_creator(FK): creator of item is assigned when created
	    Optional: item_details: any extra details about the item that the user adds on creation
	    item_quantity: the amount (or measurement) of the item that is needed. 
        checked_status: Status for whether or not a user check marked that item, default is naw
        item_id: id generated to associate the particular item to a particular list
        product_id(FK): id generated to associate an item with its master product, will be used somehow for item verification process
'''
class items(models.Model):
    item_creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name = 'items_creator')
    containing_list = models.ForeignKey(lists) #associating list that contains this item
    product = models.ForeignKey(products, null=True) #associating product that this item may or may not be based off of
    item_id = models.AutoField(primary_key = True)
    item_name = models.CharField(max_length = 128)
    checked_status = models.BooleanField(default = 0)
    item_details = models.TextField(max_length = 256)
    item_quantity = models.CharField(max_length = 128)
    
    def __str__(self):              # __unicode__ on Python 2
        return self.item_name

    class Meta:
        ordering = ('item_name',)
        verbose_name = ('Item')
        verbose_name_plural = ('Items')