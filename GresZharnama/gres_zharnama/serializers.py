from rest_framework import serializers
from .models import Material, Order, StockIn

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='material.name')

    class Meta:
        model = Order
        fields = ['id', 'customer', 'material', 'material_name', 'meters_needed', 'comment', 'waste_meters', 'status', 'created_at'] 

class StockInSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockIn
        fields = '__all__'