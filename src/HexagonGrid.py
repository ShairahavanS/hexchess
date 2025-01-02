import random

from Hexagon import Hexagon

class HexagonGrid:

    def __init__(self, sideLength):
        self.sideLength = sideLength
        self.columns = sideLength*2 - 1
        self.rows = sideLength*4 - 3
        self.grid = [
            [Hexagon(row, column) for row in range(self.rows)] 
            for column in range(self.columns)
        ]
        self.numCells = ((self.sideLength*2 - 2)*(self.sideLength*2 - 1) - (self.sideLength)*(self.sideLength -1)) + 2*self.sideLength - 1
        self.totalMines = int( 0.2*self.numCells)
        self.codes = {}
        self.numberRevealed = self.numCells - self.totalMines
        self.flagsAvailable = self.totalMines

        for outer in range(self.sideLength):
            for inner in range(self.sideLength - outer-1):
                self.grid[self.columns - 1 - outer][inner].outOfBounds = 1
                self.grid[outer][inner].outOfBounds = 1
                self.grid[outer][self.rows - 1 - inner].outOfBounds = 1
                self.grid[self.columns - 1 - outer][self.rows - 1 - inner].outOfBounds = 1

        for row in range(self.rows):
            for column in range(self.columns):
                if (row + column)%2 == 0:
                    self.grid[column][row].outOfBounds = 1

        for column in range(self.columns):
            for row in range(self.rows):
                if self.grid[column][row].outOfBounds == 0:
                    print(f"Row: {row}, Col: {column}")

        code = 0
        for column in range(self.columns):
            for row in range(self.rows):
                if self.grid[column][row].outOfBounds == 0:
                    self.grid[column][row].code = code
                    self.codes[code] = (column, row)
                    code = code + 1

                    if (row-2) >= 0:
                        if self.grid[column][row-2].outOfBounds == 0:
                            self.grid[column][row].bottom = self.grid[column][row-2]
                    if (row+2) < self.rows:
                        if self.grid[column][row+2].outOfBounds == 0:
                            self.grid[column][row].top = self.grid[column][row+2]
                    if (column-1) >= 0:
                        if (row-1) >= 0:
                            if self.grid[column-1][row-1].outOfBounds == 0:
                                self.grid[column][row].topLeft = self.grid[column-1][row-1]
                        if (row+1) < self.rows:
                            if self.grid[column-1][row+1].outOfBounds == 0:
                                self.grid[column][row].bottomLeft = self.grid[column-1][row+1]
                    if (column+1) < self.columns:
                        if (row-1) >= 0:
                            if self.grid[column+1][row-1].outOfBounds == 0:
                                self.grid[column][row].topRight = self.grid[column+1][row-1]
                        if (row+1) < self.rows:
                            if self.grid[column+1][row+1].outOfBounds == 0:
                                self.grid[column][row].bottomRight = self.grid[column+1][row+1]
        


        self.generateFlags(5, 12)

        self.printTest()
                    

    def generateFlags(self, columnNumber, rowNumber):

        self.grid[columnNumber][rowNumber].startingPoint = 1
        if self.grid[columnNumber][rowNumber].top != 0:
            self.grid[columnNumber][rowNumber].top.startingpoint = 1
        if self.grid[columnNumber][rowNumber].topLeft != 0:
            self.grid[columnNumber][rowNumber].topLeft.startingpoint = 1
        if self.grid[columnNumber][rowNumber].topRight != 0:
            self.grid[columnNumber][rowNumber].topRight.startingpoint = 1
        if self.grid[columnNumber][rowNumber].bottom != 0:
            self.grid[columnNumber][rowNumber].bottom.startingpoint = 1
        if self.grid[columnNumber][rowNumber].bottomLeft != 0:
            self.grid[columnNumber][rowNumber].bottomLeft.startingpoint = 1
        if self.grid[columnNumber][rowNumber].bottomRight != 0:
            self.grid[columnNumber][rowNumber].bottomRight.startingpoint = 1

        for mines in range(self.totalMines):
            check = 0
            while check == 0:
                random_number = random.randint(0, self.numCells-1)
                rowNumber = self.codes[random_number][1]
                columnNumber = self.codes[random_number][0]
                if (self.grid[columnNumber][rowNumber].outOfBounds == 0 and self.grid[columnNumber][rowNumber].startingPoint == 0): 
                    if (self.grid[columnNumber][rowNumber].mine == 0):
                        self.grid[columnNumber][rowNumber].mine = 1
                        check = 1
        
        for column in range(self.columns):
            for row in range(self.rows):
                if self.grid[column][row].mine == 0:
                    
                    if self.grid[column][row].top != 0:
                        if self.grid[column][row].top.mine == 1 and self.grid[column][row].top.outOfBounds == 0:
                            self.grid[column][row].adjacent += 1
                    if self.grid[column][row].topRight != 0:
                        if self.grid[column][row].topRight.mine == 1 and self.grid[column][row].topRight.outOfBounds == 0:
                            self.grid[column][row].adjacent += 1
                    if self.grid[column][row].topLeft != 0:
                        if self.grid[column][row].topLeft.mine == 1 and self.grid[column][row].topLeft.outOfBounds == 0:
                            self.grid[column][row].adjacent += 1
                    if self.grid[column][row].bottom != 0:
                        if self.grid[column][row].bottom.mine == 1 and self.grid[column][row].bottom.outOfBounds == 0:
                            self.grid[column][row].adjacent += 1
                    if self.grid[column][row].bottomRight != 0:
                        if self.grid[column][row].bottomRight.mine == 1 and self.grid[column][row].bottomRight.outOfBounds == 0:
                            self.grid[column][row].adjacent += 1
                    if self.grid[column][row].bottomLeft != 0:
                        if self.grid[column][row].bottomLeft.mine == 1 and self.grid[column][row].bottomLeft.outOfBounds == 0:
                            self.grid[column][row].adjacent += 1

    def flagCell(self, columnClick, rowClick):
        if self.grid[columnClick][rowClick].revealed == 0 and self.grid[columnClick][rowClick].flagged == 0:
            self.grid[columnClick][rowClick].flagged = 1
            self.flagsAvailable -= 1
    
    def unflagCell(self, columnClick, rowClick):
        if self.grid[columnClick][rowClick].revealed == 0 and self.grid[columnClick][rowClick].flagged == 1:
            self.grid[columnClick][rowClick].flagged = 0
            self.flagsAvailable += 1

    def singleClickCell(self, columnClick, rowClick):
        if self.grid[columnClick][rowClick].mine == 1:
            self.gameLost()
        else: 
            if self.grid[columnClick][rowClick] != 0:
                self.grid[columnClick][rowClick].revealed = 1
                self.numberRevealed -= 1
            else:
                self.grid[columnClick][rowClick].revealed = 1
                self.numberRevealed -= 1
            
            if self.numberRevealed == 0:
                self.gameWon()

    def doubleClickCell(self, columnClick, rowClick):
        if self.grid[columnClick][rowClick].revealed == 1:
            flagCount = 0

            if self.grid[columnClick][rowClick].top != 0:
                if self.grid[columnClick][rowClick].top.flagged == 1 and self.grid[columnClick][rowClick].top.outOfBounds == 0:
                    flagCount += 1
            if self.grid[columnClick][rowClick].topRight != 0:
                if self.grid[columnClick][rowClick].topRight.flagged == 1 and self.grid[columnClick][rowClick].topRight.outOfBounds == 0:
                    flagCount += 1
            if self.grid[columnClick][rowClick].topLeft != 0:
                if self.grid[columnClick][rowClick].topLeft.flagged == 1 and self.grid[columnClick][rowClick].topLeft.outOfBounds == 0:
                    flagCount += 1
            if self.grid[columnClick][rowClick].bottom != 0:
                if self.grid[columnClick][rowClick].bottom.flagged == 1 and self.grid[columnClick][rowClick].bottom.outOfBounds == 0:
                    flagCount += 1
            if self.grid[columnClick][rowClick].bottomRight != 0:
                if self.grid[columnClick][rowClick].bottomRight.flagged == 1 and self.grid[columnClick][rowClick].bottomRight.outOfBounds == 0:
                    flagCount += 1
            if self.grid[columnClick][rowClick].bottomLeft != 0:
                if self.grid[columnClick][rowClick].bottomLeft.flagged == 1 and self.grid[columnClick][rowClick].bottomLeft.outOfBounds == 0:
                    flagCount += 1

            if flagCount == self.grid[columnClick][rowClick].adjacent:
                dummy = 0



            


    def gameLost(self):
        dummy = 0

    def gameWon(self):
        dummy = 0
    
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


    def get_point(self, row, col):
        if 0 <= row < self.num_rows and 0 <= col < self.num_cols:
            return self.grid[col][row]
        else:
            raise IndexError("Row or Column out of bounds")
        
    def setFlags(self, flags):
        for flag in flags:
            print("yeah")


    # def __repr__(self):
    #     return '\n'.join([' '.join([str(self.grid[row][col]) for col in range(self.num_cols)]) for row in range(self.num_rows)])

    # def __str__(self):
    #     """
    #     Return a user-friendly string representation of the grid.
    #     """
    #     return '\n'.join([f"Row {row}: " + ', '.join([f"({self.grid[row][col].row}, {self.grid[row][col].col})" for col in range(self.num_cols)]) for row in range(self.num_rows)])

    # def get_neighbors(self, row, col):
    #     neighbors = []
    #     directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # Up, Down, Left, Right
    #     for dr, dc in directions:
    #         new_row, new_col = row + dr, col + dc
    #         if 0 <= new_row < self.num_rows and 0 <= new_col < self.num_cols:
    #             neighbors.append(self.grid[new_row][new_col])
    #     return neighbors

sure = HexagonGrid(6)
