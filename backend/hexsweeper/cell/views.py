from django.shortcuts import render
from rest_framework import viewsets
from .serializers import CellSerializer
from .models import Cell

# Create your views here.
class CellView(viewsets.ModelViewSet):
    serializer_class = CellSerializer
    queryset = Cell.objects.all()