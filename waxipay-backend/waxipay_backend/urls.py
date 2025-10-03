# ===========================================
# waxipay_backend/urls.py
# ===========================================
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="WaxiPay API",
      default_version='v1',
      description="API de paiement mobile pour le Sénégal avec intégration PayTek",
      contact=openapi.Contact(email="contact@waxipay.sn"),
      license=openapi.License(name="Propriétaire"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/payments/', include('payments.urls')),
    
    # Documentation API
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='api-docs'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='api-redoc'),
]
