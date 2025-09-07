from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Game, Cell
from .serializers import GameSerializer, CellSerializer
import random
import uuid

class StartGame(APIView):
    def post(self, request, format=None):
        level = request.data.get('level', 'Easy')
        game = Game.objects.create(level=level)
        game.create_board()
        game.save()

        serializer = GameSerializer(game)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class SingleClickGame(APIView):
    def get(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)
        serializer = GameSerializer(game)
        return Response(serializer.data)

    def post(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)
        key = request.query_params.get('key', request.data.get('key'))

        if game.progress == 'NS' or game.progress == 'IP':
            game.singleClickCell(str(key)) 

        serializer = GameSerializer(game)
        return Response(serializer.data)
    
    
class DoubleClickGame(APIView):
    def get(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)
        serializer = GameSerializer(game)
        return Response(serializer.data)

    def post(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)
        key = request.data.get('key')

        if game.progress == 'NS' or game.progress == 'IP':
            game.doubleClickCell(key)

        serializer = GameSerializer(game)
        return Response(serializer.data)
    
class FlagGame(APIView):
    def get(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)
        serializer = GameSerializer(game)
        return Response(serializer.data)

    def post(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)
        key = request.data.get('key')

        game.flagCell(int(key))

        serializer = GameSerializer(game)
        return Response(serializer.data)

class ResetGame(APIView):
    def get(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)
        serializer = GameSerializer(game)
        return Response(serializer.data)
    
    def post(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)

        game.reset_game()
        game.save()

        serializer = GameSerializer(game)
        return Response(serializer.data)
    
class DeleteGame(APIView):
    def delete(self, request, game_ID, format=None):
        game = get_object_or_404(Game, game_ID=game_ID)

        game.deleteCells()
        game.delete()
        return Response({"detail": "Game deleted successfully."}, status=status.HTTP_204_NO_CONTENT)