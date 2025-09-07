from django.contrib import admin
from .models import Game, Cell

# class GameAdmin(admin.ModelAdmin):
#     list_display = ('game_ID', 'level', 'progress', 'rows', 'cols', 'mines')

admin.site.register(Game)
admin.site.register(Cell)