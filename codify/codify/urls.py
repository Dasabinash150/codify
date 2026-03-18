from django.contrib import admin
from django.urls import path, include


urlpatterns = [

    path('admin/', admin.site.urls),
    path('api/user/',include('account.urls')),
    path('api/',include('contest.urls')),
    # path('api/', include('judge.urls')),
    # path("api/judge/", include("judge.urls")),
]

