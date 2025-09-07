import random

from HexSquare import HexSquare
from ChessPiece import ChessPiece
from ChessPiece import Pawn
from ChessPiece import Knight
from ChessPiece import Bishop
from ChessPiece import Rook
from ChessPiece import Queen
from ChessPiece import King

class HexChessBoard:

    def __init__(self):
        # Properties
        self.sideLength = 6
        self.columns = 11
        self.rows = 21
        self.grid = [
            [HexSquare(row, column) for row in range(self.rows)] 
            for column in range(self.columns)
        ]
        self.turn = 0

        # Get rid of cells outside hexagon
        for outer in range(self.sideLength):
            for inner in range(self.sideLength - outer - 1):
                self.grid[self.columns - 1 - outer][inner].outOfBounds = 1
                self.grid[outer][inner].outOfBounds = 1
                self.grid[outer][self.rows - 1 - inner].outOfBounds = 1
                self.grid[self.columns - 1 - outer][self.rows - 1 - inner].outOfBounds = 1

        # Get rid of cells inside hexagon that dont exist (kind of on imaginary plane)
        for row in range(self.rows):
            for column in range(self.columns):
                if (row + column) % 2 == 0:
                    self.grid[column][row].outOfBounds = 1

        # Assign codes to valid cells
        code = 0
        for column in range(self.columns):
            for row in range(self.rows):
                if self.grid[column][row].outOfBounds == 0:
                    # Assign neighbors (referencing existing Hexagons)
                    if (row - 2) >= 0 and self.grid[column][row - 2].outOfBounds == 0:
                        self.grid[column][row].bottom = self.grid[column][row - 2]  # Reference to the bottom hexagon

                    if (row + 2) < self.rows and self.grid[column][row + 2].outOfBounds == 0:
                        self.grid[column][row].top = self.grid[column][row + 2]  # Reference to the top hexagon

                    if (column - 1) >= 0:
                        if (row - 1) >= 0 and self.grid[column - 1][row - 1].outOfBounds == 0:
                            self.grid[column][row].topLeft = self.grid[column - 1][row - 1]  # Reference to the top-left hexagon
                        if (row + 1) < self.rows and self.grid[column - 1][row + 1].outOfBounds == 0:
                            self.grid[column][row].bottomLeft = self.grid[column - 1][row + 1]  # Reference to the bottom-left hexagon

                    if (column + 1) < self.columns:
                        if (row - 1) >= 0 and self.grid[column + 1][row - 1].outOfBounds == 0:
                            self.grid[column][row].topRight = self.grid[column + 1][row - 1]  # Reference to the top-right hexagon
                        if (row + 1) < self.rows and self.grid[column + 1][row + 1].outOfBounds == 0:
                            self.grid[column][row].bottomRight = self.grid[column + 1][row + 1]  # Reference to the bottom-right hexagon
                    

    def gameLost(self):
        for items in self.minesArray:
            rowNumber = self.codes[items][1]
            columnNumber = self.codes[items][0]

            self.grid[columnNumber][rowNumber].revealed = 1

    def gameWon(self):
        self.won = 0
    
    def printTest(self):
        #print the hexagon
        for row in range(self.rows):
            sure = ""
            for column in range(self.columns):
                if self.grid[column][row].outOfBounds == 1:
                    sure = sure + "   "
                elif self.grid[column][row].mine == 1:
                    sure = sure + " X "
                else:
                    sure = sure + " " + str(self.grid[column][row].adjacent) + " "
            print(sure)
    
    def print(self):
        #print the hexagon
        for row in range(self.rows):
            sure = ""
            for column in range(self.columns):
                if self.grid[column][row].outOfBounds == 1:
                    sure = sure + "   "
                elif self.grid[column][row].revealed == 0:
                    sure = sure + " X "
                elif self.grid[column][row].flagged == 1:
                    sure = sure + " F "
                else:
                    sure = sure + " " + str(self.grid[column][row].adjacent) + " "
            print(sure)

    def get_point(self, row, col):
        if 0 <= row < self.num_rows and 0 <= col < self.num_cols:
            return self.grid[col][row]
        else:
            raise IndexError("Row or Column out of bounds")
        
    def setFlags(self, flags):
        for flag in flags:
            print("yeah")

sure = HexChessBoard()


