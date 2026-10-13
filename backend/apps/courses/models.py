"""
Course and Curriculum models for Bright Mindz Academy.
"""

from django.db import models
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

class TeachingLanguage(models.Model):
    """
    Configurable teaching language (e.g., Malayalam, Tamil, Hindi).
    Allows administration to easily introduce new Indian mother tongues.
    """
    name = models.CharField(_('language name in English'), max_length=50, unique=True)
    native_name = models.CharField(_('native script name'), max_length=100, blank=True)
    code = models.CharField(_('ISO code'), max_length=10, unique=True)
    is_active = models.BooleanField(_('is active'), default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = _('Teaching Language')
        verbose_name_plural = _('Teaching Languages')
        ordering = ['display_order', 'name']

    def __str__(self):
        return f"{self.name} ({self.native_name})" if self.native_name else self.name


class Course(models.Model):
    """
    Main Spoken English course entity.
    """
    PROFICIENCY_FOUNDATION = 'foundation'
    PROFICIENCY_BEGINNER = 'beginner'
    PROFICIENCY_INTERMEDIATE = 'intermediate'
    PROFICIENCY_ADVANCED = 'advanced'

    PROFICIENCY_CHOICES = [
        (PROFICIENCY_FOUNDATION, _('Foundation / Absolute Beginner')),
        (PROFICIENCY_BEGINNER, _('Beginner')),
        (PROFICIENCY_INTERMEDIATE, _('Intermediate')),
        (PROFICIENCY_ADVANCED, _('Advanced')),
    ]

    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_ARCHIVED = 'archived'

    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_PUBLISHED, _('Published')),
        (STATUS_ARCHIVED, _('Archived')),
    ]

    title = models.CharField(_('course title'), max_length=200)
    slug = models.SlugField(_('URL slug'), max_length=220, unique=True, blank=True)
    subtitle = models.CharField(_('short subtitle / hook'), max_length=300, blank=True)
    description = models.TextField(_('detailed description'))
    learning_objectives = models.JSONField(
        _('learning objectives list'),
        default=list,
        blank=True,
        help_text=_('JSON array of key takeaways and student benefits.')
    )
    target_audience = models.TextField(_('who this course is for'), blank=True)

    teaching_language = models.ForeignKey(
        TeachingLanguage,
        on_delete=models.PROTECT,
        related_name='courses',
        verbose_name=_('mother tongue medium')
    )
    proficiency_level = models.CharField(
        _('proficiency level'),
        max_length=20,
        choices=PROFICIENCY_CHOICES,
        default=PROFICIENCY_BEGINNER
    )

    price = models.DecimalField(_('price (INR)'), max_digits=8, decimal_places=2)
    discount_price = models.DecimalField(
        _('discounted / offer price (INR)'),
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    estimated_duration_hours = models.DecimalField(
        _('estimated total hours'),
        max_digits=5,
        decimal_places=1,
        default=12.0
    )
    access_duration_days = models.PositiveIntegerField(
        _('access validity in days (0 for lifetime access)'),
        default=365
    )

    thumbnail_url = models.CharField(_('thumbnail image URL'), max_length=500, blank=True)
    thumbnail = models.ImageField(_('thumbnail image upload'), upload_to='courses/thumbnails/', null=True, blank=True)

    trainer_name = models.CharField(_('lead trainer name'), max_length=150, default='Bright Mindz Senior Faculty')
    trainer_title = models.CharField(_('lead trainer credentials'), max_length=200, default='Certified Spoken English Coach')

    publication_status = models.CharField(
        _('publication status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT
    )
    is_featured = models.BooleanField(_('featured on homepage'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Course')
        verbose_name_plural = _('Courses')
        ordering = ['-is_featured', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} [{self.teaching_language.name}]"

    @property
    def effective_price(self):
        """Current payable price (discount if available, otherwise regular price)."""
        if self.discount_price and self.discount_price > 0:
            return self.discount_price
        return self.price

    @property
    def total_lessons_count(self):
        return Lesson.objects.filter(module__course=self, publication_status=Lesson.STATUS_PUBLISHED).count()

    @property
    def total_duration_minutes(self):
        total_seconds = sum(
            Lesson.objects.filter(
                module__course=self,
                publication_status=Lesson.STATUS_PUBLISHED
            ).values_list('duration_seconds', flat=True)
        )
        return round(total_seconds / 60)


class Module(models.Model):
    """
    Curriculum module / chapter within a course.
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='modules',
        verbose_name=_('course')
    )
    title = models.CharField(_('module title'), max_length=200)
    description = models.TextField(_('module overview'), blank=True)
    position = models.PositiveIntegerField(_('display order'), default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Course Module')
        verbose_name_plural = _('Course Modules')
        ordering = ['position', 'id']
        unique_together = [['course', 'position']]

    def __str__(self):
        return f"{self.course.title} - Module {self.position}: {self.title}"


class Lesson(models.Model):
    """
    Individual video lesson within a module.
    """
    PROVIDER_CLOUDFLARE = 'cloudflare'
    PROVIDER_BUNNY = 'bunny'
    PROVIDER_MOCK = 'mock'

    PROVIDER_CHOICES = [
        (PROVIDER_CLOUDFLARE, 'Cloudflare Stream'),
        (PROVIDER_BUNNY, 'Bunny Stream'),
        (PROVIDER_MOCK, 'Development Mock Provider'),
    ]

    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'

    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_PUBLISHED, _('Published')),
    ]

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name='lessons',
        verbose_name=_('module')
    )
    title = models.CharField(_('lesson title'), max_length=200)
    description = models.TextField(_('lesson notes / summary'), blank=True)
    position = models.PositiveIntegerField(_('lesson sequence'), default=1)

    video_provider = models.CharField(
        _('video provider'),
        max_length=20,
        choices=PROVIDER_CHOICES,
        default=PROVIDER_MOCK
    )
    provider_video_id = models.CharField(
        _('provider video identifier or mock ID'),
        max_length=255,
        default='sample_spoken_english_lesson_1'
    )
    duration_seconds = models.PositiveIntegerField(
        _('duration in seconds'),
        default=600
    )
    is_preview = models.BooleanField(
        _('free preview lesson'),
        default=False,
        help_text=_('If enabled, visitors can sample this lesson before purchasing.')
    )
    publication_status = models.CharField(
        _('publication status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PUBLISHED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Lesson')
        verbose_name_plural = _('Lessons')
        ordering = ['position', 'id']
        unique_together = [['module', 'position']]

    def __str__(self):
        preview_tag = " [FREE PREVIEW]" if self.is_preview else ""
        return f"{self.module.course.title} -> {self.title}{preview_tag}"

    @property
    def formatted_duration(self):
        minutes = self.duration_seconds // 60
        seconds = self.duration_seconds % 60
        return f"{minutes}:{seconds:02d}"
