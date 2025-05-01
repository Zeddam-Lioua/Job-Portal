from django.core.management.base import BaseCommand
from core.models import Occupation, Skill, Language
import os
import csv
from django.conf import settings

class Command(BaseCommand):
    help = 'Populate database with ESCO skills, occupations, and languages from local CSV files'

    def handle(self, *args, **options):
        data_path = os.path.join(settings.BASE_DIR, 'core', 'data', 'esco')

        # --- Languages ---
        self.stdout.write('Populating languages...')
        lang_path = os.path.join(data_path, 'ESCO dataset - v1.2.0 - classification - en - csv', 'languages_en.csv')
        if os.path.exists(lang_path):
            with open(lang_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    code = row.get('code', '').strip()
                    name = row.get('name', '').strip()
                    native_name = row.get('native_name', '').strip()
                    if code:
                        Language.objects.get_or_create(
                            code=code,
                            defaults={'name': name, 'native_name': native_name}
                        )
        else:
            self.stdout.write(self.style.WARNING('languages.csv not found, skipping languages.'))

        # --- Occupations ---
        self.stdout.write('Populating occupations...')
        occ_path = os.path.join(data_path, 'ESCO dataset - v1.2.0 - classification - en - csv', 'occupations_en.csv')
        if os.path.exists(occ_path):
            with open(occ_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.reader(csvfile)
                for row in reader:
                    # Only process rows that start with 'Occupation'
                    if len(row) > 5 and row[0] == 'Occupation':
                        esco_code = row[1].strip()
                        title = row[3].strip()
                        description = row[5].strip() if len(row) > 5 else ''
                        category = row[2].strip() if len(row) > 2 else ''
                        if esco_code:
                            Occupation.objects.get_or_create(
                                esco_code=esco_code,
                                defaults={
                                    'title': title,
                                    'description': description,
                                    'category': category
                                }
                            )
        else:
            self.stdout.write(self.style.WARNING('occupations_en.csv not found, skipping occupations.'))

               # --- Skills ---
        self.stdout.write('Populating skills...')
        skills_path = os.path.join(data_path, 'ESCO dataset - v1.2.0 - classification - en - csv', 'skills_en.csv')
        if os.path.exists(skills_path):
            with open(skills_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    esco_code = row.get('conceptUri', '').strip()
                    name = row.get('preferredLabel', '').strip()
                    description = row.get('description', '').strip()
                    category = row.get('skillType', '').strip()
                    if esco_code and name:
                        Skill.objects.get_or_create(
                            esco_code=esco_code,
                            defaults={
                                'name': name,
                                'description': description,
                                'category': category
                            }
                        )
        else:
            self.stdout.write(self.style.WARNING('skills_en.csv not found, skipping skills.'))

        self.stdout.write(self.style.SUCCESS('Successfully populated ESCO data'))