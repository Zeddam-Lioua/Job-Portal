# Generated by Django 5.1.4 on 2025-02-23 15:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_notification'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='entity_id',
            field=models.IntegerField(null=True),
        ),
    ]
