from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from .forms import ThreadForm, PostForm
from .models import Thread, Post
from django.contrib.auth.decorators import user_passes_test

# Create your views here.
def index(request):
    return render(request, 'forum/forums.html')

def forums(request):
    return render(request, 'forum/forums.html')

def posts(request):
    return render(request, 'forum/posts.html')

def detail(request):
    return render(request, 'forum/detail.html')

def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('index')
    else:
        form = UserCreationForm()
    return render(request, 'forum/register.html', {'form': form})


def create_thread(request):
    if request.method == 'POST':
        form = ThreadForm(request.POST)
        if form.is_valid():
            thread = form.save(commit=False)
            thread.created_by = request.user
            thread.save()
            return redirect('thread_detail', pk=thread.pk)
    else:
        form = ThreadForm()
    return render(request, 'forum/create_thread.html', {'form': form})

def thread_list(request):
    threads = Thread.objects.all()
    return render(request, 'forum/thread_list.html', {'threads': threads})

def thread_detail(request, pk):
    thread = get_object_or_404(Thread, pk=pk)
    posts = thread.posts.all()
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.thread = thread
            post.created_by = request.user
            post.save()
            return redirect('thread_detail', pk=thread.pk)
    else:
        form = PostForm()
    return render(request, 'forum/thread_detail.html', {'thread': thread, 'posts': posts, 'form': form})

def create_post(request, thread_id):
    thread = Thread.objects.get(id=thread_id)
    if request.method == 'POST':
        form = PostForm(request.POST)
        if form.is_valid():
            post = form.save(commit=False)
            post.thread = thread
            post.author = request.user
            post.save()
            return redirect('detail', thread_id=thread.id)
    else:
        form = PostForm()
    return render(request, 'forum/create_post.html', {'form': form, 'thread': thread})

@user_passes_test(lambda u: u.groups.filter(name='Moderator').exists())
def delete_post(request, pk):
    post = get_object_or_404(Post, pk=pk)
    post.delete()
    return redirect('thread_detail', pk=post.thread.pk)