from rest_framework import serializers
from .models import Game, Cell

# Optimized Cell serializer
class CellSerializer(serializers.ModelSerializer):
    kind = serializers.SerializerMethodField()

    class Meta:
        model = Cell
        fields = ["key", "kind"]

    def get_kind(self, obj):

        if obj.honey:
            return "honey"
        
        # Flagged always wins
        if obj.flagged:
            return "flag"

        # Unrevealed cells should reveal NOTHING
        if not obj.revealed and not obj.honey:
            return "hidden"

        # Revealed cells

        if obj.mine:
            return "mine"
        

        # Numbered cell (0–8)
        return str(obj.adjacent)

class GameInitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = [
            "game_ID",
            "progress",
            "level",
            "mines",
            "flags",
            "numberRevealed",
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
    
# Optimized Game serializer
class GameSingleMoveSerializer(serializers.ModelSerializer):
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
        # IMPORTANT: only return changed cells
        if not hasattr(obj, "_changed_cells"):
            return []  # No changes tracked in this request

        changed_cells = obj.get_changed_cells()
        return CellSerializer(changed_cells, many=True).data


