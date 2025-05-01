from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SkillViewSet, OccupationViewSet, LanguageViewSet,
    CountryViewSet, StateViewSet, CityViewSet
)

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'occupations', OccupationViewSet)
router.register(r'languages', LanguageViewSet)
router.register(r'countries', CountryViewSet)
router.register(r'states', StateViewSet)
router.register(r'cities', CityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]