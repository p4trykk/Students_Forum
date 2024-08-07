from django.db import models
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType

class Thread(models.Model):
    title = models.CharField(max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Post(models.Model):
    thread = models.ForeignKey(Thread, related_name='posts', on_delete=models.CASCADE)
    content = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Post by {self.created_by} on {self.thread}'

moderator_group, created = Group.objects.get_or_create(name='Moderator')
admin_group, created = Group.objects.get_or_create(name='Administrator')

content_type = ContentType.objects.get_for_model(Post)

permission = Permission.objects.get(
    codename='delete_post',
    content_type=content_type,
)
moderator_group.permissions.add(permission)

admin_group.permissions.set(Permission.objects.all())

user = User.objects.get(username='moderator_user')
moderator_group.user_set.add(user)

admin_user = User.objects.get(username='admin_user')
admin_group.user_set.add(admin_user)
