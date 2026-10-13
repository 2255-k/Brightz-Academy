"""
Management command to populate realistic development seed data for Bright Mindz Academy.
"""

from django.core.management.base import BaseCommand
from apps.courses.models import TeachingLanguage, Course, Module, Lesson
from apps.content.models import Trainer, Testimonial, FAQ

class Command(BaseCommand):
    help = 'Populates development database with realistic courses, curriculum, trainers, and FAQs.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Bright Mindz Academy demo data population..."))

        # 1. Languages
        languages = [
            {'name': 'Malayalam', 'native_name': 'മലയാളം', 'code': 'ml', 'display_order': 1},
            {'name': 'Tamil', 'native_name': 'தமிழ்', 'code': 'ta', 'display_order': 2},
            {'name': 'Hindi', 'native_name': 'हिन्दी', 'code': 'hi', 'display_order': 3},
            {'name': 'Kannada', 'native_name': 'ಕನ್ನಡ', 'code': 'kn', 'display_order': 4},
            {'name': 'Telugu', 'native_name': 'తెలుగు', 'code': 'te', 'display_order': 5},
        ]

        lang_objs = {}
        for l in languages:
            obj, _ = TeachingLanguage.objects.update_or_create(
                code=l['code'],
                defaults={'name': l['name'], 'native_name': l['native_name'], 'display_order': l['display_order'], 'is_active': True}
            )
            lang_objs[l['code']] = obj
            self.stdout.write(f"Language configured: {obj.name}")

        # 2. Courses
        courses_data = [
            {
                'title': 'Spoken English Mastery in Malayalam',
                'slug': 'spoken-english-mastery-malayalam',
                'subtitle': 'Master daily English conversation, grammar, and pronunciation explained step-by-step in Malayalam.',
                'description': 'Designed specifically for learners from Kerala. Start from sentence building basics, eliminate Malayalam mother-tongue influence, and build natural confidence in social, workplace, and telephonic interactions.',
                'learning_objectives': [
                    'Speak fluent, grammatical English without mentally translating from Malayalam',
                    'Master accurate pronunciation and eliminate common mother-tongue accent hurdles',
                    'Gain confidence in office meetings, customer interactions, and everyday public situations',
                    'Expand active English vocabulary with 500+ practical phrases used daily'
                ],
                'target_audience': 'College students, working professionals, homemakers, and job seekers who understand Malayalam and want fluent spoken English.',
                'teaching_language': lang_objs['ml'],
                'proficiency_level': Course.PROFICIENCY_FOUNDATION,
                'price': 3499.00,
                'discount_price': 1999.00,
                'estimated_duration_hours': 16.0,
                'access_duration_days': 365,
                'thumbnail_url': 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
                'trainer_name': 'Anjali Nair',
                'trainer_title': 'Lead Faculty & Senior Spoken English Coach, Kochi',
                'publication_status': Course.STATUS_PUBLISHED,
                'is_featured': True,
                'modules': [
                    {
                        'position': 1,
                        'title': 'Module 1: Thinking in English & Sounds Training',
                        'description': 'Laying the ground rules for natural sentence generation without Malayalam translation.',
                        'lessons': [
                            {'position': 1, 'title': 'How to Stop Translating Malayalam to English in Your Mind', 'duration': 720, 'is_preview': True},
                            {'position': 2, 'title': 'Vowels, Consonants and Crucial Silent Letters', 'duration': 900, 'is_preview': False},
                            {'position': 3, 'title': 'Neutralizing Malayalam Accent Tendencies', 'duration': 1080, 'is_preview': False},
                        ]
                    },
                    {
                        'position': 2,
                        'title': 'Module 2: Practical Daily Conversations',
                        'description': 'Real-world sentence frames for social, shopping, and everyday scenarios.',
                        'lessons': [
                            {'position': 1, 'title': 'Introducing Yourself with Authority & Politeness', 'duration': 840, 'is_preview': False},
                            {'position': 2, 'title': 'Asking Directions, Shopping, and Dining Out', 'duration': 960, 'is_preview': False},
                            {'position': 3, 'title': 'Telephone Etiquette and Handling Audio Calls', 'duration': 1200, 'is_preview': False},
                        ]
                    },
                    {
                        'position': 3,
                        'title': 'Module 3: Grammar Without Frustration',
                        'description': 'Mastering tenses and active sentence frames through contextual spoken examples.',
                        'lessons': [
                            {'position': 1, 'title': 'Tenses Simplified: Past, Present & Future in Spoken English', 'duration': 1320, 'is_preview': False},
                            {'position': 2, 'title': 'Prepositions in Action (In, On, At, By, For)', 'duration': 1080, 'is_preview': False},
                        ]
                    },
                    {
                        'position': 4,
                        'title': 'Module 4: Professional Workplace Fluency',
                        'description': 'Interviews, presentations, and corporate email discussions.',
                        'lessons': [
                            {'position': 1, 'title': 'Handling Job Interviews with Poise and Preparedness', 'duration': 1800, 'is_preview': False},
                            {'position': 2, 'title': 'Clear Email Writing and Client Communication', 'duration': 1500, 'is_preview': False},
                        ]
                    }
                ]
            },
            {
                'title': 'Spoken English Foundation in Tamil',
                'slug': 'spoken-english-foundation-tamil',
                'subtitle': 'Learn practical Spoken English through clear Tamil explanations at your own pace.',
                'description': 'Tailored for Tamil speakers wanting to progress from basic sentences to confident conversations. No tedious grammar memorization—just intuitive examples and speaking drills.',
                'learning_objectives': [
                    'Overcome shyness and hesitation when speaking with English speakers',
                    'Build sentences naturally using daily conversational templates',
                    'Correct common pronunciation errors specific to Tamil speakers',
                    'Perform well in interviews and professional conversations'
                ],
                'target_audience': 'Job aspirants, engineers, nurses, and business owners looking for effortless spoken English.',
                'teaching_language': lang_objs['ta'],
                'proficiency_level': Course.PROFICIENCY_BEGINNER,
                'price': 3499.00,
                'discount_price': 1999.00,
                'estimated_duration_hours': 14.0,
                'access_duration_days': 365,
                'thumbnail_url': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
                'trainer_name': 'Karthik Sundaram',
                'trainer_title': 'Corporate Communication Specialist & Language Coach',
                'publication_status': Course.STATUS_PUBLISHED,
                'is_featured': True,
                'modules': [
                    {
                        'position': 1,
                        'title': 'Module 1: English Foundations for Tamil Learners',
                        'description': 'Core sentence structures and sound awareness.',
                        'lessons': [
                            {'position': 1, 'title': 'Building Practical Daily Vocabulary in Tamil Medium', 'duration': 660, 'is_preview': True},
                            {'position': 2, 'title': 'Overcoming Mother Tongue Influence (MTI) with Ease', 'duration': 900, 'is_preview': False},
                        ]
                    },
                    {
                        'position': 2,
                        'title': 'Module 2: Daily Fluency Drills',
                        'description': 'Expressing opinions, asking questions, and conversation flow.',
                        'lessons': [
                            {'position': 1, 'title': 'Expressing Opinions and Disagreements Politely', 'duration': 1080, 'is_preview': False},
                            {'position': 2, 'title': 'Essential Idioms for Natural Daily Conversation', 'duration': 1200, 'is_preview': False},
                        ]
                    }
                ]
            },
            {
                'title': 'Everyday Spoken English Fluency in Hindi',
                'slug': 'spoken-english-fluency-hindi',
                'subtitle': 'Eliminate translation hesitation and speak fluent English through Hindi guidance.',
                'description': 'Stop getting stuck on grammar rules. Learn conversational English phrases, correct pronunciation, and real-life dialogue through clear, friendly Hindi explanations.',
                'learning_objectives': [
                    'Speak without pausing to translate Hindi sentences into English',
                    'Gain confidence in group discussions and interview panels',
                    'Master polite professional phrasing for emails and client calls',
                    'Pronounce difficult words smoothly with clear intonation'
                ],
                'target_audience': 'Students, graduates, and professionals across India who want to speak English fluently.',
                'teaching_language': lang_objs['hi'],
                'proficiency_level': Course.PROFICIENCY_INTERMEDIATE,
                'price': 3999.00,
                'discount_price': 2499.00,
                'estimated_duration_hours': 15.0,
                'access_duration_days': 365,
                'thumbnail_url': 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
                'trainer_name': 'Sunita Sharma',
                'trainer_title': 'Senior Language Trainer & Voice Coach',
                'publication_status': Course.STATUS_PUBLISHED,
                'is_featured': True,
                'modules': [
                    {
                        'position': 1,
                        'title': 'Module 1: Conquering Hesitation & Mental Translation',
                        'description': 'Methods to trigger spontaneous English responses.',
                        'lessons': [
                            {'position': 1, 'title': 'Breaking the Habit of Hindi-to-English Mental Translation', 'duration': 900, 'is_preview': True},
                            {'position': 2, 'title': 'Rhythm, Stress & Natural Sentence Intonation', 'duration': 1080, 'is_preview': False},
                        ]
                    },
                    {
                        'position': 2,
                        'title': 'Module 2: Nuanced Corporate & Social Communication',
                        'description': 'Diplomatic communication and job interview mastery.',
                        'lessons': [
                            {'position': 1, 'title': 'Polite Phrasing in Business Meetings and Calls', 'duration': 1320, 'is_preview': False},
                            {'position': 2, 'title': 'Group Discussion Techniques & Impromptu Speaking', 'duration': 1500, 'is_preview': False},
                        ]
                    }
                ]
            },
            {
                'title': 'Executive English & Workplace Communication',
                'slug': 'executive-english-workplace-communication',
                'subtitle': 'Advanced communication strategies for leadership, meetings, and global teams.',
                'description': 'For professionals looking to transition from basic English to high-impact executive presence. Refine vocabulary, deliver crisp presentations, and master diplomacy in high-stakes discussions.',
                'learning_objectives': [
                    'Lead high-impact presentations and global client meetings',
                    'Articulate complex technical or strategic thoughts with precision',
                    'Master boardroom diplomacy and constructive negotiation phrasing'
                ],
                'target_audience': 'Senior professionals, team leads, doctors, lawyers, and entrepreneurs.',
                'teaching_language': lang_objs['ml'],
                'proficiency_level': Course.PROFICIENCY_ADVANCED,
                'price': 4999.00,
                'discount_price': 2999.00,
                'estimated_duration_hours': 18.0,
                'access_duration_days': 365,
                'thumbnail_url': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
                'trainer_name': 'Anjali Nair',
                'trainer_title': 'Lead Faculty & Senior Spoken English Coach, Kochi',
                'publication_status': Course.STATUS_PUBLISHED,
                'is_featured': False,
                'modules': [
                    {
                        'position': 1,
                        'title': 'Module 1: Executive Presence & Articulation',
                        'description': 'Advanced spoken structures for leadership.',
                        'lessons': [
                            {'position': 1, 'title': 'Delivering Ideas with Clarity and Executive Brevity', 'duration': 960, 'is_preview': True},
                            {'position': 2, 'title': 'Chairing Cross-Border Meetings and Negotiations', 'duration': 1440, 'is_preview': False},
                        ]
                    }
                ]
            }
        ]

        for c_data in courses_data:
            modules_data = c_data.pop('modules')
            course, _ = Course.objects.update_or_create(
                slug=c_data['slug'],
                defaults=c_data
            )
            self.stdout.write(f"Course created/updated: {course.title}")

            for m_data in modules_data:
                lessons_data = m_data.pop('lessons')
                module, _ = Module.objects.update_or_create(
                    course=course,
                    position=m_data['position'],
                    defaults={'title': m_data['title'], 'description': m_data['description']}
                )
                for l_data in lessons_data:
                    Lesson.objects.update_or_create(
                        module=module,
                        position=l_data['position'],
                        defaults={
                            'title': l_data['title'],
                            'duration_seconds': l_data['duration'],
                            'is_preview': l_data['is_preview'],
                            'video_provider': Lesson.PROVIDER_MOCK,
                            'provider_video_id': f"bma_video_{course.slug}_{module.position}_{l_data['position']}",
                            'publication_status': Lesson.STATUS_PUBLISHED
                        }
                    )

        # 3. Trainers
        trainers = [
            {
                'name': 'Anjali Nair',
                'title': 'Senior Language Coach & Mother Tongue Lead',
                'bio': 'Over 9 years of expertise training students and professionals across Kerala. Specializes in helping Malayalam speakers eliminate hesitation and speak with crisp pronunciation.',
                'languages_spoken': 'Malayalam, English, Hindi',
                'experience_years': 9,
                'photo_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
                'display_order': 1,
            },
            {
                'name': 'Karthik Sundaram',
                'title': 'Corporate Communication & Fluency Coach',
                'bio': 'Trainer with 8+ years coaching IT and healthcare professionals in Chennai and Kochi. Passionate about mother-tongue-based progressive language acquisition.',
                'languages_spoken': 'Tamil, English, Malayalam',
                'experience_years': 8,
                'photo_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
                'display_order': 2,
            },
            {
                'name': 'Sunita Sharma',
                'title': 'Voice & Accent Specialist',
                'bio': '12+ years of language pedagogy. Expert in transition drills that eliminate mental translation from Hindi and build spontaneous fluency.',
                'languages_spoken': 'Hindi, English',
                'experience_years': 12,
                'photo_url': 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=600&auto=format&fit=crop&q=80',
                'display_order': 3,
            }
        ]

        for t in trainers:
            Trainer.objects.update_or_create(name=t['name'], defaults=t)
            self.stdout.write(f"Trainer added: {t['name']}")

        # 4. Testimonials (explicitly marked is_demo=True)
        testimonials = [
            {
                'student_name': 'Rahul Menon',
                'role_or_location': 'Software Engineer, Infopark Kochi',
                'mother_tongue': 'Malayalam',
                'course_name': 'Spoken English Mastery in Malayalam',
                'quote': 'Learning through Malayalam made all the difference. I used to hesitate in client scrums, but the daily sentence patterns gave me immediate confidence.',
                'rating': 5,
                'is_demo': True,
                'display_order': 1,
            },
            {
                'student_name': 'Priya Selvaraj',
                'role_or_location': 'Staff Nurse, Chennai',
                'mother_tongue': 'Tamil',
                'course_name': 'Spoken English Foundation in Tamil',
                'quote': 'Being able to study at my own pace after hospital night shifts was ideal. The explanations in Tamil removed all my confusion around English tenses.',
                'rating': 5,
                'is_demo': True,
                'display_order': 2,
            },
            {
                'student_name': 'Aman Verma',
                'role_or_location': 'Logistics Supervisor, Kochi',
                'mother_tongue': 'Hindi',
                'course_name': 'Everyday Spoken English Fluency in Hindi',
                'quote': 'The best part is no rote grammar memorization. The focus is 100% on speaking clearly without thinking in Hindi first. Excellent course!',
                'rating': 5,
                'is_demo': True,
                'display_order': 3,
            }
        ]

        for test in testimonials:
            Testimonial.objects.update_or_create(student_name=test['student_name'], defaults=test)

        # 5. FAQs
        faqs = [
            {
                'category': FAQ.CATEGORY_GENERAL,
                'question': 'How does learning English in my mother tongue help?',
                'answer': 'Most learners struggle not with intelligence, but with the pressure of having new grammar explained in an unfamiliar language. When concepts are explained in your mother tongue (Malayalam, Tamil, or Hindi), your brain understands the logic instantly. You then learn how to bridge that understanding directly into spoken English without painful mental translation.',
                'display_order': 1,
            },
            {
                'category': FAQ.CATEGORY_GENERAL,
                'question': 'Can anyone join, regardless of age or educational background?',
                'answer': 'Yes, absolutely! Bright Mindz Academy welcomes learners of all ages, backgrounds, and starting proficiencies. Whether you are a college student, job seeker, working professional, homemaker, or senior citizen, our courses start from comfortable basics.',
                'display_order': 2,
            },
            {
                'category': FAQ.CATEGORY_COURSES,
                'question': 'Are these classes live or pre-recorded?',
                'answer': 'All lessons are pre-recorded high-definition video lessons. You can learn comfortably at your own pace, anytime, anywhere, on your mobile phone, tablet, or laptop, without the stress of scheduled live batch timings.',
                'display_order': 3,
            },
            {
                'category': FAQ.CATEGORY_COURSES,
                'question': 'How long do I have access to my course?',
                'answer': 'Standard enrollment provides 365 days (1 full year) of unlimited access to your video library, allowing you to re-watch lessons and practice pronunciation drills as often as you like.',
                'display_order': 4,
            },
            {
                'category': FAQ.CATEGORY_PAYMENTS,
                'question': 'Which payment methods are accepted?',
                'answer': 'We support all major Indian payment options via secure Razorpay checkout, including UPI (Google Pay, PhonePe, Paytm), Debit & Credit cards, and Net Banking.',
                'display_order': 5,
            },
            {
                'category': FAQ.CATEGORY_TECHNICAL,
                'question': 'Can I watch the lessons on my mobile phone?',
                'answer': 'Yes. Our platform is fully responsive and optimized for mobile devices, tablets, and desktop computers. You only need a modern web browser and an active internet connection.',
                'display_order': 6,
            }
        ]

        for f in faqs:
            FAQ.objects.update_or_create(question=f['question'], defaults=f)

        self.stdout.write(self.style.SUCCESS("Demo seed data successfully loaded into Bright Mindz Academy!"))
