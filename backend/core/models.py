from django.db import models
from django.conf import settings
from core.esco.local import ESCOLocal
from langcodes import Language as LangCode


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100)
    esco_code = models.CharField(max_length=100, unique=True, null=True)  # Add this
    description = models.TextField(null=True, blank=True)  # Add this

    def __str__(self):
        return self.name

    @classmethod
    def populate_from_esco(cls):
        esco = ESCOLocal(settings.ESCO_DATA_PATH)
        for skill in esco.get_skills():
            cls.objects.get_or_create(
                esco_code=skill['code'],
                defaults={
                    'name': skill['name'],
                    'description': skill['description'],
                    'category': skill['category']
                }
            )

# Add a new model for job fields/occupations
class Occupation(models.Model):
    title = models.CharField(max_length=200)
    esco_code = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100)

    def __str__(self):
        return self.title

    @classmethod
    def populate_from_esco(cls):
        esco = ESCOLocal(settings.ESCO_DATA_PATH)
        for occ in esco.get_occupations():
            cls.objects.get_or_create(
                esco_code=occ['code'],
                defaults={
                    'title': occ['title'],
                    'description': occ['description'],
                    'category': occ['category']
                }
            )
        
class Language(models.Model):
    code = models.CharField(max_length=2, primary_key=True)  # ISO 639-1 code
    name = models.CharField(max_length=100)
    native_name = models.CharField(max_length=100)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.native_name})"

    @classmethod
    def populate_languages(cls):
        common_languages = ['en', 'fr', 'ar', 'es', 'de', 'zh', 'ru']
        for code in common_languages:
            lang = LangCode.get(code)
            cls.objects.get_or_create(
                code=code,
                defaults={
                    'name': lang.display_name(),
                    'native_name': lang.autonym()
                }
            )

class Country(models.Model):
    code = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class State(models.Model):
    code = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='states')

    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='cities', null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='cities')

    def __str__(self):
        return self.name
    
