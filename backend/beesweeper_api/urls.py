from django.urls import path
from .views import StartGame, SingleClickGame, DoubleClickGame, FlagGame,  ResetGame, DeleteGame

urlpatterns = [
    path('start/', StartGame.as_view(), name='start_game'),  # Starting a new game
    path('<uuid:game_ID>/single/', SingleClickGame.as_view(), name='single_game'),  # Single click on a game
    path('<uuid:game_ID>/double/', DoubleClickGame.as_view(), name='double_game'),  # Double click on a game
    path('<uuid:game_ID>/flag/', FlagGame.as_view(), name='flag_game'),  # Flag a cell in a game
    path('<uuid:game_ID>/reset/', ResetGame.as_view(), name='reset_game'),  # Reset a game
    path('<uuid:game_ID>/delete/', DeleteGame.as_view(), name='delete_game'),  # Delete a game
]