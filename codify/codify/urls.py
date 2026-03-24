from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to Codify API 🚀")


urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/user/',include('account.urls')),
    path('api/',include('contest.urls')),
    path("api/", include("judge.urls")),
]

