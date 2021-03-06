# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-03-06 19:37
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('data_manager', '0003_auto_20160306_1922'),
    ]

    operations = [
        migrations.AlterField(
            model_name='items',
            name='containing_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='containing_list', to='data_manager.lists'),
        ),
        migrations.AlterField(
            model_name='items',
            name='item_creator',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='item_creator', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='items',
            name='product',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='product', to='data_manager.products'),
        ),
        migrations.AlterField(
            model_name='lists',
            name='list_creator',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='list_creator', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='products',
            name='store',
            field=models.ManyToManyField(related_name='products', to='data_manager.stores'),
        ),
        migrations.AlterField(
            model_name='stores',
            name='store_address',
            field=models.ManyToManyField(related_name='addresses', to='data_manager.addresses'),
        ),
        migrations.AlterField(
            model_name='tags',
            name='tag_creator',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tag_creator', to=settings.AUTH_USER_MODEL),
        ),
    ]
