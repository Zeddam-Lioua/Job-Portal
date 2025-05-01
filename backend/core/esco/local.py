import csv
from typing import List, Dict
import logging
import os

logger = logging.getLogger(__name__)

class ESCOLocal:
    def __init__(self, data_path: str):
        self.data_path = data_path

    def get_occupations(self) -> List[Dict]:
        occupations = []
        file_path = os.path.join(self.data_path, "ESCO dataset - v1.2.0 - classification - en - csv", "occupations_en.csv")
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    occupations.append({
                        'code': row.get('URI') or row.get('id'),
                        'title': row.get('preferredLabel') or row.get('title'),
                        'description': row.get('description', ''),
                        'category': row.get('ISCOGroup', '') or row.get('category', '')
                    })
        except Exception as e:
            logger.error(f"Error loading occupations: {str(e)}")
        return occupations

    def get_skills(self) -> List[Dict]:
        skills = []
        file_path = os.path.join(self.data_path, "ESCO dataset - v1.2.0 - classification - en - csv", "skills_en.csv")
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    skills.append({
                        'code': row.get('URI') or row.get('id'),
                        'name': row.get('preferredLabel') or row.get('title'),
                        'description': row.get('description', ''),
                        'category': row.get('skillType', '') or row.get('category', '')
                    })
        except Exception as e:
            logger.error(f"Error loading skills: {str(e)}")
        return skills

    def get_languages(self) -> List[Dict]:
        languages = []
        file_path = os.path.join(
            self.data_path,
            "ESCO dataset - v1.2.0 - classification - en - csv",
            "languages_en.csv"
        )
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    native_name = row.get('native name')
                    if not native_name:
                        native_name = row.get('name', '')  # fallback to English name or empty string
                    languages.append({
                        'code': row.get('639-1'),
                        'name': row.get('name'),
                        'native_name': native_name or ''
                    })
        except Exception as e:
            logger.error(f"Error loading languages: {str(e)}")
        return languages