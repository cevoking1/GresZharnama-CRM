from rest_framework import viewsets
from .models import Material, Order, StockIn
from .serializers import MaterialSerializer, OrderSerializer, StockInSerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class OrderViewSet(viewsets.ModelViewSet):
    # Сортируем новые заказы наверх
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

class StockInViewSet(viewsets.ModelViewSet):
    # Сортируем новые закупки наверх, чтобы Асет сразу видел последние поступления
    queryset = StockIn.objects.all().order_by('-date_added')
    serializer_class = StockInSerializer