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
    board = serializers.SerializerMethodField()

    class Meta:
        model = Game
        fields = [
            "game_ID",
            "progress",
            "level",
            "mines",
            "flags",
            "numberRevealed",
            "board",
        ]

    def get_board(self, obj):
        # Only include non-out-of-bounds cells
        valid_cells = obj.board.filter(outofBounds=False)
        return CellSerializer(valid_cells, many=True, context={"game": obj}).data
