from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from gres_zharnama.views import MaterialViewSet, OrderViewSet, StockInViewSet
from rest_framework.authtoken import views

router = DefaultRouter()
router.register(r'materials', MaterialViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'stockins', StockInViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # Все наши данные будут тут
    path('api/login/', views.obtain_auth_token),
]