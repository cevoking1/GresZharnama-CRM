from django.db import models

class Material(models.Model):
    name = models.CharField(max_length=100)
    stock_meters = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.name

# Эту модель мы случайно стерли, возвращаем:
class StockIn(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.material.name} - Приход: {self.amount}м"

class Order(models.Model):
    customer = models.CharField(max_length=200)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    meters_needed = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Наше новое поле для брака
    waste_meters = models.DecimalField(max_digits=10, decimal_places=2, default=0) 
    
    status = models.CharField(max_length=20, default='waiting')
    created_at = models.DateTimeField(auto_now_add=True)

class StockIn(models.Model):
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_added = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Если это новая запись (приход только что создали)
        if not self.pk:
            self.material.stock_meters += self.amount
            self.material.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.material.name} - {self.amount}м"

    # Умная логика сохранения и списания со склада
    def save(self, *args, **kwargs):
        if self.pk:
            old_order = Order.objects.get(pk=self.pk)
            # Если статус поменялся на 'done'
            if old_order.status != 'done' and self.status == 'done':
                # Считаем общий расход (заказ + брак)
                total_expense = self.meters_needed + self.waste_meters
                self.material.stock_meters -= total_expense
                self.material.save()
                
        super().save(*args, **kwargs)