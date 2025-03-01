# Generated by Django 5.1.4 on 2025-01-18 09:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0005_alter_resume_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='jobpost',
            name='education_level',
            field=models.CharField(choices=[('indiffirent', 'Indifferent'), ('high_school', 'High School'), ('bac', 'Bac'), ('bac+1', 'Bac +1'), ('bac+2', 'Bac +2'), ('bac+3', 'Bac +3'), ('bachelors', "Bachelor's Degree"), ('masters', "Master's Degree"), ('phd', 'Ph.D.')], max_length=50),
        ),
        migrations.AlterField(
            model_name='jobpost',
            name='workplace',
            field=models.CharField(choices=[('on_site', 'On Site'), ('hybrid', 'Hybrid'), ('remote', 'Remote')], max_length=50),
        ),
        migrations.AlterField(
            model_name='jobrequest',
            name='education_level',
            field=models.CharField(choices=[('indiffirent', 'Indifferent'), ('high_school', 'High School'), ('bac', 'Bac'), ('bac+1', 'Bac +1'), ('bac+2', 'Bac +2'), ('bac+3', 'Bac +3'), ('bachelors', "Bachelor's Degree"), ('masters', "Master's Degree"), ('phd', 'Ph.D.')], help_text='Select the required education level', max_length=50, verbose_name='Education Level'),
        ),
        migrations.AlterField(
            model_name='jobrequest',
            name='workplace',
            field=models.CharField(choices=[('on_site', 'On Site'), ('hybrid', 'Hybrid'), ('remote', 'Remote')], help_text='Select the workplace type', max_length=50, verbose_name='Workplace'),
        ),
    ]
