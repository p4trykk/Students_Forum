from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.index, name='index'),
    path('forums/', views.forums, name='forums'),  
    path('posts/', views.posts, name='posts'),  
    path('detail/', views.detail, name='detail'),
    path('login/', auth_views.LoginView.as_view(template_name='forum/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', views.register, name='register'),
    path('create-thread/', views.create_thread, name='create_thread'),
    path('thread/<int:thread_id>/create-post/', views.create_post, name='create_post'),
    path('', views.thread_list, name='thread_list'),
    path('thread/<int:pk>/', views.thread_detail, name='thread_detail'),
    path('create_thread/', views.create_thread, name='create_thread'),
    path('delete_post/<int:pk>/', views.delete_post, name='delete_post'),

]
