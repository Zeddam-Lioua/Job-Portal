from django.db import connection

def force_create_tables():  # Changed function name to match what we're importing
    with connection.cursor() as cursor:
        # Drop existing tables first
        cursor.execute("""
            DROP TABLE IF EXISTS interviews_recording CASCADE;
            DROP TABLE IF EXISTS interviews_interview CASCADE;
        """)
        
        # Create Interview table
        cursor.execute("""
            CREATE TABLE interviews_interview (
                id SERIAL PRIMARY KEY,
                meeting_id VARCHAR(100) UNIQUE NOT NULL,
                guest_id VARCHAR(255),
                interviewer_id INTEGER REFERENCES users_customuser(id),
                candidate_id INTEGER REFERENCES jobs_applicant(id),
                scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
                status VARCHAR(20) DEFAULT 'scheduled',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                type VARCHAR(20) DEFAULT 'scheduled'
            )
        """)
        
        # Create Recording table
        cursor.execute("""
            CREATE TABLE interviews_recording (
                id SERIAL PRIMARY KEY,
                interviewer_id INTEGER REFERENCES users_customuser(id),
                interview_id INTEGER REFERENCES interviews_interview(id),
                video_url VARCHAR(200) NOT NULL,
                chat_log TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)