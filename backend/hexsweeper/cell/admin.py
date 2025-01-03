from django.contrib import admin
from .models import Cell

# Register your models here.
class CellAdmin(admin.ModelAdmin):
    list_display = ('row', 'col', 'code', 'outOfBounds', 'mine', 'startingPoint', 'adjacent', 'revealed', 'visited', 'flagged', 'top', 'topRight', 'bottomRight', 'bottom', 'bottomLeft', 'topLeft')

admin.site.register(Cell, CellAdmin)