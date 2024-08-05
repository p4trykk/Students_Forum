from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'forum/forums.html')

def forums(request):
    return render(request, 'forum/forums.html')

def posts(request):
    return render(request, 'forum/posts.html')

def detail(request):
    return render(request, 'forum/detail.html')