from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('forums/', views.forums, name='forums'),  
    path('posts/', views.posts, name='posts'),  
    path('detail/', views.detail, name='detail'),
]
