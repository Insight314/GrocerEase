# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-02-14 19:56
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lists', '0003_auto_20160214_1906'),
    ]

    operations = [
        migrations.AlterField(
            model_name='items',
            name='product',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='lists.products'),
        ),
    ]
