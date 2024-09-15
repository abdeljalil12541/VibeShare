from django.shortcuts import render

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, template_name='frontend/index.html')