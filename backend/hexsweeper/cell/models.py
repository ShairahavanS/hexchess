from django.db import models

# Create your models here.
class Cell(models.Model):
    row = models.IntegerField()
    col = models.IntegerField()
    code = models.IntegerField()
    outOfBounds = models.BooleanField()
    mine = models.BooleanField()
    startingPoint = models.BooleanField()
    adjacent = models.IntegerField()
    revealed = models.BooleanField()
    visited = models.BooleanField()
    flagged = models.BooleanField()

    top = models.BooleanField()
    topRight = models.BooleanField()
    bottomRight = models.BooleanField()
    bottom = models.BooleanField()
    bottomLeft = models.BooleanField()
    topLeft = models.BooleanField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['row', 'col'], name='unique_cell')
        ]

    # def __init__(self, col, row):
    #     self.row = row
    #     self.col = col
    #     self.code = 0
    #     self.outOfBounds = 0
    #     self.mine = 0
    #     self.startingPoint = 0
    #     self.adjacent = 0
    #     self.revealed = 0
    #     self.visited = 0
    #     self.flagged = 0

    #     self.top = 0
    #     self.topRight = 0
    #     self.bottomRight = 0
    #     self.bottom = 0
    #     self.bottomLeft = 0
    #     self.topLeft = 0

    def __str__(self):
        return f"Row: {self.row}, Col: {self.col}"
    