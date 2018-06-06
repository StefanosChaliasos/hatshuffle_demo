from django.conf.urls import url
from .views import MixAPIView, DecryptAPIView

app_name = 'mix'

urlpatterns = [
    url(r'^mix/', MixAPIView.as_view()),
    url(r'^decrypt/', DecryptAPIView.as_view()),
]
