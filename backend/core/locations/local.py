import csv
import os
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class LocationLocal:
    def __init__(self, data_path: str):
        self.data_path = data_path

    def get_countries(self) -> List[Dict]:
        countries = []
        file_path = os.path.join(self.data_path, "countries.csv")
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    code = (row.get('code') or row.get('country_code') or '').strip()
                    name = (row.get('name') or row.get('country_name') or '').strip()
                    if code:  # Only add if code is not empty
                        countries.append({'code': code, 'name': name})
        except Exception as e:
            logger.error(f"Error loading countries: {str(e)}")
        return countries

    def get_states(self) -> List[Dict]:
        states = []
        file_path = os.path.join(self.data_path, "states.csv")
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    states.append({
                        'code': row.get('code') or row.get('state_code'),
                        'name': row.get('name') or row.get('state_name'),
                        'country_code': row.get('country_code')
                    })
        except Exception as e:
            logger.error(f"Error loading states: {str(e)}")
        return states

    def get_cities(self) -> List[Dict]:
        cities = []
        file_path = os.path.join(self.data_path, "cities.csv")
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    cities.append({
                        'name': row.get('name') or row.get('city_name'),
                        'state_code': row.get('state_code'),
                        'country_code': row.get('country_code')
                    })
        except Exception as e:
            logger.error(f"Error loading cities: {str(e)}")
        return cities