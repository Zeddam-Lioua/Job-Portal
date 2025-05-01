from django.core.management.base import BaseCommand
from core.models import Country, State, City
import os
import csv
from django.conf import settings

class Command(BaseCommand):
    help = 'Populate database with countries, states, and cities from local CSV files'

    def handle(self, *args, **options):
        data_path = os.path.join(settings.BASE_DIR, 'core', 'data', 'locations')

        # --- Countries ---
        self.stdout.write('Populating countries...')
        countries_path = os.path.join(data_path, 'countries.csv')
        if os.path.exists(countries_path):
            with open(countries_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    code = row['iso2'].strip()
                    name = row['name'].strip()
                    if code:
                        Country.objects.get_or_create(code=code, defaults={'name': name})
        else:
            self.stdout.write(self.style.WARNING('countries.csv not found, skipping countries.'))

        # --- States ---
        self.stdout.write('Populating states...')
        states_path = os.path.join(data_path, 'states.csv')
        if os.path.exists(states_path):
            with open(states_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    code = row['state_code'].strip()
                    name = row['name'].strip()
                    country_code = row['country_id'].strip()
                    # Find country by id in countries.csv, which is the 'id' column
                    country = Country.objects.filter(code=row['country_id']).first()
                    if not country:
                        # Try by country_code if country_id fails (for robustness)
                        country = Country.objects.filter(code=row.get('country_code', '').strip()).first()
                    if code and country:
                        State.objects.get_or_create(code=code, defaults={'name': name, 'country': country})
        else:
            self.stdout.write(self.style.WARNING('states.csv not found, skipping states.'))

        # --- Cities ---
        self.stdout.write('Populating cities...')
        cities_path = os.path.join(data_path, 'cities.csv')
        if os.path.exists(cities_path):
            with open(cities_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    name = row['name'].strip()
                    state_code = row['state_code'].strip()
                    country_code = row['country_code'].strip()
                    country = Country.objects.filter(code=country_code).first()
                    state = State.objects.filter(code=state_code).first() if state_code else None
                    if name and country:
                        City.objects.get_or_create(name=name, country=country, state=state)
        else:
            self.stdout.write(self.style.WARNING('cities.csv not found, skipping cities.'))

        self.stdout.write(self.style.SUCCESS('Successfully populated locations data'))