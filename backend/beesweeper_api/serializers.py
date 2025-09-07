from rest_framework import serializers
from .models import Game, Cell

# Serializer for the Cell model
class CellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cell
        fields = '__all__'

# Serializer for the Game model
class GameSerializer(serializers.ModelSerializer):
    board = CellSerializer(many=True)

    class Meta:
        model = Game
        fields = '__all__'