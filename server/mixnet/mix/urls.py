from django.conf.urls import url
from .views import MixAPIView, DecryptAPIView, VoteMixAPIView

app_name = 'mix'

urlpatterns = [
    url(r'^votemix/', VoteMixAPIView.as_view()),
    url(r'^mix/', MixAPIView.as_view()),
    url(r'^decrypt/', DecryptAPIView.as_view()),
]
