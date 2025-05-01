from rest_framework import serializers
from .models import Skill, Occupation, Language, Country, State, City

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class OccupationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Occupation
        fields = '__all__'

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'

class StateSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    country_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = State
        fields = ['code', 'name', 'country', 'country_code']

    def create(self, validated_data):
        country_code = validated_data.pop('country_code', None)
        if country_code:
            validated_data['country'] = Country.objects.get(code=country_code)
        return super().create(validated_data)

class CitySerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    state = StateSerializer(read_only=True)
    country_code = serializers.CharField(write_only=True, required=False)
    state_code = serializers.CharField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'country', 'state_code', 'country_code']

    def create(self, validated_data):
        country_code = validated_data.pop('country_code', None)
        state_code = validated_data.pop('state_code', None)
        if country_code:
            validated_data['country'] = Country.objects.get(code=country_code)
        if state_code:
            validated_data['state'] = State.objects.get(code=state_code)
        return super().create(validated_data)