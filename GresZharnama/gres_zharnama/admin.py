from django.contrib import admin
from .models import Material, Order, StockIn

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'stock_meters')

@admin.register(StockIn)
class StockInAdmin(admin.ModelAdmin):
    # Исправили: quantity -> amount, date -> date_added
    list_display = ('material', 'amount', 'date_added') 

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # Добавили waste_meters, чтобы видеть брак в таблице
    list_display = ('customer', 'material', 'meters_needed', 'waste_meters', 'status', 'created_at')
    list_filter = ('status', 'material') # Фильтры сбоку для удобства
    search_fields = ('customer',) # Поиск по имени