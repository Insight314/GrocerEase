# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-02-14 17:58
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('registration', '0003_migrate_activatedstatus'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='addresses',
            fields=[
                ('address_id', models.AutoField(primary_key=True, serialize=False)),
                ('street_name', models.CharField(max_length=128)),
                ('city_name', models.CharField(max_length=30)),
                ('state_code', models.CharField(max_length=2)),
                ('zip_code', models.CharField(max_length=5)),
            ],
            options={
                'ordering': ('address_id',),
            },
        ),
        migrations.CreateModel(
            name='items',
            fields=[
                ('item_id', models.AutoField(primary_key=True, serialize=False)),
                ('item_name', models.CharField(max_length=128)),
                ('checked_status', models.BooleanField(default=0)),
                ('item_details', models.TextField(max_length=256)),
                ('item_quantity', models.CharField(max_length=128)),
            ],
            options={
                'ordering': ('item_name',),
            },
        ),
        migrations.CreateModel(
            name='lists',
            fields=[
                ('list_name', models.CharField(max_length=128)),
                ('list_id', models.AutoField(primary_key=True, serialize=False)),
                ('list_creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ('list_name',),
            },
        ),
        migrations.CreateModel(
            name='products',
            fields=[
                ('product_id', models.AutoField(primary_key=True, serialize=False)),
                ('product_name', models.CharField(max_length=128)),
                ('product_price', models.DecimalField(decimal_places=2, max_digits=6)),
                ('product_availability', models.BooleanField(default=1)),
                ('product_details', models.TextField(max_length=256)),
            ],
            options={
                'ordering': ('product_name',),
            },
        ),
        migrations.CreateModel(
            name='stores',
            fields=[
                ('store_id', models.AutoField(primary_key=True, serialize=False)),
                ('store_name', models.CharField(max_length=128)),
                ('store_details', models.TextField(max_length=256)),
                ('store_number', models.CharField(max_length=15)),
                ('store_address', models.ManyToManyField(to='lists.addresses')),
            ],
            options={
                'ordering': ('store_name',),
            },
        ),
        migrations.CreateModel(
            name='tags',
            fields=[
                ('tag_id', models.AutoField(primary_key=True, serialize=False)),
                ('tag_name', models.CharField(max_length=32)),
                ('tag_details', models.TextField(max_length=128)),
                ('tag_creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='registration.RegistrationProfile')),
            ],
            options={
                'ordering': ('tag_name',),
            },
        ),
        migrations.AddField(
            model_name='products',
            name='store',
            field=models.ManyToManyField(to='lists.stores'),
        ),
        migrations.AddField(
            model_name='lists',
            name='list_tags',
            field=models.ManyToManyField(to='lists.tags'),
        ),
        migrations.AddField(
            model_name='lists',
            name='list_users',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='items',
            name='containing_list',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lists.lists'),
        ),
        migrations.AddField(
            model_name='items',
            name='item_creator',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='items',
            name='product',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lists.products'),
        ),
    ]
