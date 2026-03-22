from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "Codify API is running"
    })

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/user/',include('account.urls')),
    path('api/',include('contest.urls')),
    # path('api/', include('judge.urls')),
    # path("api/judge/", include("judge.urls")),
]

