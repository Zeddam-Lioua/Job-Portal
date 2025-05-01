from rest_framework import viewsets, permissions
from .models import Skill, Occupation, Language, Country, State, City
from .serializers import (
    SkillSerializer, OccupationSerializer, LanguageSerializer,
    CountrySerializer, StateSerializer, CitySerializer
)

class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]

class OccupationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Occupation.objects.all().order_by('title')
    serializer_class = OccupationSerializer
    permission_classes = [permissions.AllowAny]

class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Language.objects.all().order_by('name')
    serializer_class = LanguageSerializer
    permission_classes = [permissions.AllowAny]

class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]

class StateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = State.objects.all().order_by('name')
    serializer_class = StateSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        country_code = self.request.query_params.get('country_code')
        if country_code:
            queryset = queryset.filter(country__code=country_code)
        return queryset

class CityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = City.objects.all().order_by('name')
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        country_code = self.request.query_params.get('country_code')
        state_code = self.request.query_params.get('state_code')
        if country_code:
            queryset = queryset.filter(country__code=country_code)
        if state_code:
            queryset = queryset.filter(state__code=state_code)
        return queryset