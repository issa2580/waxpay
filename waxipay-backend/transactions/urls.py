# ===========================================
# transactions/urls.py
# ===========================================
from django.urls import path
from . import views

app_name = 'transactions'

urlpatterns = [
    path('', views.TransactionListView.as_view(), name='list'),
    path('<uuid:pk>/', views.TransactionDetailView.as_view(), name='detail'),
    path('stats/', views.TransactionStatsView.as_view(), name='stats'),
]