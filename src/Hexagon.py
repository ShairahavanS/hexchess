class Hexagon:
    def __init__(self, col, row):
        self.row = row
        self.col = col
        self.code = 0
        self.outOfBounds = 0
        self.mine = 0
        self.startingPoint = 0
        self.adjacent = 0
        self.revealed = 0
        self.visited = 0
        self.flagged = 0

        self.top = 0
        self.topRight = 0
        self.bottomRight = 0
        self.bottom = 0
        self.bottomLeft = 0
        self.topLeft = 0


    def __repr__(self):
        return f"Point({self.row}, {self.col})"


    def __str__(self):
        return f"Row: {self.row}, Col: {self.col}"
    


