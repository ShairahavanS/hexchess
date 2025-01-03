from rest_framework import serializers
from .models import Cell

class CellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cell
        fields = ('row', 'col', 'code', 'outOfBounds', 'mine', 'startingPoint', 'adjacent', 'revealed', 'visited', 'flagged', 'top', 'topRight', 'bottomRight', 'bottom', 'bottomLeft', 'topLeft')