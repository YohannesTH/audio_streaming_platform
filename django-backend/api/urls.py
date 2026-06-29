from django.urls import path
from . import views

urlpatterns = [
    path('search', views.search_youtube, name='search'),
    path('stream/<str:video_id>', views.get_stream_url, name='stream'),
    path('proxy-stream/<str:video_id>', views.proxy_stream, name='proxy-stream'),
    path('download/<str:video_id>', views.download_audio, name='download'),
]
