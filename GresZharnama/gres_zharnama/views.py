from rest_framework import viewsets
from .models import Material, Order, StockIn
from .serializers import MaterialSerializer, OrderSerializer, StockInSerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

class StockInViewSet(viewsets.ModelViewSet):
    queryset = StockIn.objects.all()
    serializer_class = StockInSerializer