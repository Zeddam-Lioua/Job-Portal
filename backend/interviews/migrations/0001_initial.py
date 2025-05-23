# Generated by Django 5.1.4 on 2025-04-30 13:20

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0008_remove_city_country_remove_city_state_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Interview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('meeting_id', models.CharField(max_length=100, unique=True)),
                ('guest_id', models.CharField(blank=True, max_length=255, null=True)),
                ('scheduled_time', models.DateTimeField()),
                ('status', models.CharField(default='scheduled', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('type', models.CharField(default='scheduled', max_length=20)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews', to='users.applicant')),
                ('interviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-scheduled_time'],
            },
        ),
        migrations.CreateModel(
            name='Recording',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video_url', models.URLField()),
                ('chat_log', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('interview', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recordings', to='interviews.interview')),
                ('interviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recordings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
