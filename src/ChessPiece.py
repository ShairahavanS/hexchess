class ChessPiece:
    def __init__(self, col, row, colour, code, grid):
        self.row = row
        self.col = col
        self.code = code
        self.grid = grid
        self.colour = colour

    def move(self):
        pass

class Pawn(ChessPiece):
    def __init__(self, col, row, code, grid):
        super().__init__(col, row, code, grid)
        self.firstMove = 0

    def move(self):
        dummy = 0

class Knight(ChessPiece):
    def __init__(self, col, row, code, grid):
        super().__init__(col, row, code, grid)

    def move(self):
        dummy = 0

class Bishop(ChessPiece):
    def __init__(self, col, row, code, grid):
        super().__init__(col, row, code, grid)

    def move(self):
        dummy = 0

class Rook(ChessPiece):
    def __init__(self, col, row, code, grid):
        super().__init__(col, row, code, grid)

    def move(self):
        dummy = 0

class Queen(ChessPiece):
    def __init__(self, col, row, code, grid):
        super().__init__(col, row, code, grid)

    def move(self):
        dummy = 0

class King(ChessPiece):
    def __init__(self, col, row, code, grid):
        super().__init__(col, row, code, grid)

    def move(self):
        dummy = 0






