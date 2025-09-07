from rest_framework import serializers
from .models import Game, Cell

# Optimized Cell serializer
class CellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cell
        fields = [
            "key",
            "mine",
            "revealed",
            "flagged",
            "adjacent",
            "honey",
        ]

# Optimized Game serializer
class GameSerializer(serializers.ModelSerializer):
    board = CellSerializer(many=True)

    class Meta:
        model = Game
        fields = [
            "game_ID",
            "progress",
            "level",
            "flags",
            "board",
        ]
