from django.contrib import admin
from .models import Skill, Occupation, Language, Country, State, City

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'esco_code']
    search_fields = ['name', 'esco_code', 'category']

@admin.register(Occupation)
class OccupationAdmin(admin.ModelAdmin):
    list_display = ['title', 'esco_code', 'category']
    search_fields = ['title', 'esco_code', 'category']

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'native_name']
    search_fields = ['code', 'name', 'native_name']

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ['code', 'name']
    search_fields = ['code', 'name']

@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'country']
    search_fields = ['code', 'name', 'country__name']
    list_filter = ['country']

@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'state', 'country']
    search_fields = ['name', 'state__name', 'country__name']
    list_filter = ['country', 'state']