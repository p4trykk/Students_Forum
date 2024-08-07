from django.apps import AppConfig


# class ForumConfig(AppConfig):
#     default_auto_field = 'django.db.models.BigAutoField'
#     name = 'forum'


from django.apps import AppConfig
from django.db.models.signals import post_migrate

def create_user_groups(sender, **kwargs):
    from django.contrib.auth.models import Group, Permission
    from django.contrib.contenttypes.models import ContentType
    from .models import Post  # importowanie modelu Post dla uprawnień

    # Tworzenie grup
    moderator_group, created = Group.objects.get_or_create(name='Moderator')
    admin_group, created = Group.objects.get_or_create(name='Administrator')

    # Dodaj uprawnienia do grup
    content_type = ContentType.objects.get_for_model(Post)

    # Moderator: może usuwać posty
    permission = Permission.objects.get(
        codename='delete_post',
        content_type=content_type,
    )
    moderator_group.permissions.add(permission)

    # Administrator: pełne uprawnienia
    admin_group.permissions.set(Permission.objects.all())

class ForumConfig(AppConfig):
    name = 'forum'

    def ready(self):
        post_migrate.connect(create_user_groups, sender=self)