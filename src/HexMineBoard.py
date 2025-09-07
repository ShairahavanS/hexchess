import random

from Hexagon import Hexagon

class HexagonGrid:

    def __init__(self, sideLength):
        # Properties
        self.sideLength = sideLength
        self.columns = sideLength * 2 - 1
        self.rows = sideLength * 4 - 3
        self.grid = [
            [Hexagon(row, column) for row in range(self.rows)] 
            for column in range(self.columns)
        ]
        self.numCells = ((self.sideLength * 2 - 2) * (self.sideLength * 2 - 1) - (self.sideLength) * (self.sideLength - 1)) + 2 * self.sideLength - 1
        self.totalMines = int(0.2 * self.numCells)
        self.keys = {}
        self.minesArray = list()
        self.numberRevealed = self.numCells - self.totalMines
        self.flagsAvailable = self.totalMines
        self.won = 0
        self.lost = 0

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
                if (row + column) % 2 == self.sideLength%2:
                    self.grid[column][row].outOfBounds = 1

        # Assign codes to valid cells
        code = 1
        for column in range(self.columns):
            for row in range(self.rows):
                if self.grid[column][row].outOfBounds == 0:
                    self.grid[column][row].code = code
                    self.keys[code] = (column, row)
                    code = code + 1

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
                    

    def generateMines(self, columnNumber, rowNumber):

        self.grid[columnNumber][rowNumber].startingPoint = 1
        if self.grid[columnNumber][rowNumber].top != 0:
            self.grid[columnNumber][rowNumber].top.startingPoint = 1
        if self.grid[columnNumber][rowNumber].topLeft != 0:
            self.grid[columnNumber][rowNumber].topLeft.startingPoint = 1
        if self.grid[columnNumber][rowNumber].topRight != 0:
            self.grid[columnNumber][rowNumber].topRight.startingPoint = 1
        if self.grid[columnNumber][rowNumber].bottom != 0:
            self.grid[columnNumber][rowNumber].bottom.startingPoint = 1
        if self.grid[columnNumber][rowNumber].bottomLeft != 0:
            self.grid[columnNumber][rowNumber].bottomLeft.startingPoint = 1
        if self.grid[columnNumber][rowNumber].bottomRight != 0:
            self.grid[columnNumber][rowNumber].bottomRight.startingPoint = 1

        for mines in range(self.totalMines):
            check = 0
            while check == 0:
                random_number = random.randint(0, self.numCells-1)
                rowNumber = self.keys[random_number][1]
                columnNumber = self.keys[random_number][0]
                if (self.grid[columnNumber][rowNumber].outOfBounds == 0 and self.grid[columnNumber][rowNumber].startingPoint == 0): 
                    if (self.grid[columnNumber][rowNumber].mine == 0):
                        self.grid[columnNumber][rowNumber].mine = 1
                        self.grid[columnNumber][rowNumber].adjacent = "M"
                        self.minesArray.append(random_number)
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
            if self.grid[columnClick][rowClick].revealed == 0:
                if self.grid[columnClick][rowClick].adjacent == 0:
                    
                    self.grid[columnClick][rowClick].revealed = 1
                    self.numberRevealed -= 1

                    if self.grid[columnClick][rowClick].top != 0:
                        self.singleClickCell(columnClick, rowClick+2)
                    if self.grid[columnClick][rowClick].topRight != 0:
                        self.singleClickCell(columnClick+1, rowClick-1)
                    if self.grid[columnClick][rowClick].topLeft != 0:
                        self.singleClickCell(columnClick-1, rowClick-1)
                    if self.grid[columnClick][rowClick].bottom != 0:
                        self.singleClickCell(columnClick, rowClick-2)
                    if self.grid[columnClick][rowClick].bottomRight != 0:
                        self.singleClickCell(columnClick+1, rowClick+1)
                    if self.grid[columnClick][rowClick].bottomLeft != 0:
                        self.singleClickCell(columnClick-1, rowClick+1)

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
                correctFlagCheck = 0

                if self.grid[columnClick][rowClick].top != 0:
                    if self.grid[columnClick][rowClick].top.flagged == 1 and self.grid[columnClick][rowClick].top.mine == 0:
                        correctFlagCheck = 1
                if self.grid[columnClick][rowClick].topRight != 0:
                    if self.grid[columnClick][rowClick].topRight.flagged == 1 and self.grid[columnClick][rowClick].topRight.mine == 0:
                        correctFlagCheck = 1
                if self.grid[columnClick][rowClick].topLeft != 0:
                    if self.grid[columnClick][rowClick].topLeft.flagged == 1 and self.grid[columnClick][rowClick].topLeft.mine == 0:
                        correctFlagCheck = 1
                if self.grid[columnClick][rowClick].bottom != 0:
                    if self.grid[columnClick][rowClick].bottom.flagged == 1 and self.grid[columnClick][rowClick].bottom.mine == 0:
                        correctFlagCheck = 1
                if self.grid[columnClick][rowClick].bottomRight != 0:
                    if self.grid[columnClick][rowClick].bottomRight.flagged == 1 and self.grid[columnClick][rowClick].bottomRight.mine == 0:
                        correctFlagCheck = 1
                if self.grid[columnClick][rowClick].bottomLeft != 0:
                    if self.grid[columnClick][rowClick].bottomLeft.flagged == 1 and self.grid[columnClick][rowClick].bottomLeft.mine == 0:
                        correctFlagCheck = 1

                if correctFlagCheck == 0:
                    if self.grid[columnClick][rowClick].top != 0:
                        if self.grid[columnClick][rowClick].top.flagged == 0:
                            self.grid[columnClick][rowClick].top.revealed = 1
                    if self.grid[columnClick][rowClick].topRight != 0:
                        if self.grid[columnClick][rowClick].topRight.flagged == 0:
                            self.grid[columnClick][rowClick].topRight.revealed = 1
                    if self.grid[columnClick][rowClick].topLeft != 0:
                        if self.grid[columnClick][rowClick].topLeft.flagged == 0:
                            self.grid[columnClick][rowClick].topLeft.revealed = 1
                    if self.grid[columnClick][rowClick].bottom != 0:
                        if self.grid[columnClick][rowClick].bottom.flagged == 0:
                            self.grid[columnClick][rowClick].bottom.revealed = 1
                    if self.grid[columnClick][rowClick].bottomRight != 0:
                        if self.grid[columnClick][rowClick].bottomRight.flagged == 0:
                            self.grid[columnClick][rowClick].bottomRight.revealed = 1
                    if self.grid[columnClick][rowClick].bottomLeft != 0:
                        if self.grid[columnClick][rowClick].bottomLeft.flagged == 0:
                            self.grid[columnClick][rowClick].bottomLeft.revealed = 1
                else:
                    if self.grid[columnClick][rowClick].top != 0:
                        self.grid[columnClick][rowClick].top.revealed = 1
                        if self.grid[columnClick][rowClick].top.mine == 1:
                            self.minesArray.remove(self.grid[columnClick][rowClick].top.code)
                    if self.grid[columnClick][rowClick].topRight != 0:
                        self.grid[columnClick][rowClick].topRight.revealed = 1
                        if self.grid[columnClick][rowClick].topRight.mine == 1:
                            self.minesArray.remove(self.grid[columnClick][rowClick].topRight.code)
                    if self.grid[columnClick][rowClick].topLeft != 0:
                        self.grid[columnClick][rowClick].topLeft.revealed = 1
                        if self.grid[columnClick][rowClick].topLeft.mine == 1:
                            self.minesArray.remove(self.grid[columnClick][rowClick].topLeft.code)
                    if self.grid[columnClick][rowClick].bottom != 0:
                        self.grid[columnClick][rowClick].bottom.revealed = 1
                        if self.grid[columnClick][rowClick].bottom.mine == 1:
                            self.minesArray.remove(self.grid[columnClick][rowClick].bottom.code)
                    if self.grid[columnClick][rowClick].bottomRight != 0:
                        self.grid[columnClick][rowClick].bottomRight.revealed = 1
                        if self.grid[columnClick][rowClick].bottomRight.mine == 1:
                            self.minesArray.remove(self.grid[columnClick][rowClick].bottomRight.code)
                    if self.grid[columnClick][rowClick].bottomLeft != 0:
                        self.grid[columnClick][rowClick].bottomLeft.revealed = 1
                        if self.grid[columnClick][rowClick].bottomLeft.mine == 1:
                            self.minesArray.remove(self.grid[columnClick][rowClick].bottomLeft.code)
                    
                    self.gameLost()


    def gameLost(self):
        for items in self.minesArray:
            rowNumber = self.keys[items][1]
            columnNumber = self.keys[items][0]

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
                # elif self.grid[column][row].mine == 1:
                #     sure = sure + " X "
                else:
                    sure = sure + " " + str(self.grid[column][row].code) + " "
            print(sure)

            # for row in range(self.rows):
            #     for column in range(self.columns):               
            #         print(self.grid[column][row].__str__())  # Corrected the call to __str__()
            #         print(f"Out of Bounds (bool): {self.grid[column][row].outOfBounds}, "
            #             f"Code (int): {self.grid[column][row].code}, "
            #             f"Mine (bool): {self.grid[column][row].startingPoint}, "
            #             f"Adjacent (int): {self.grid[column][row].adjacent}, "
            #             f"Revealed (bool): {self.grid[column][row].revealed}, "
            #             f"Flagged (bool): {self.grid[column][row].flagged}")
            #         print("")  # Blank line between rows


    
    def print(self):
        #print the hexagon
        for row in range(self.rows):
            sure = ""
            for column in range(self.columns):
                if self.grid[column][row].outOfBounds == 1:
                    sure = sure + "   "
                elif self.grid[column][row].flagged == 1:
                    sure = sure + " F "
                elif self.grid[column][row].revealed == 0:
                    sure = sure + " X "
                else:
                    sure = sure + " " + str(self.grid[column][row].adjacent) + " "
            print(sure)
            
    def printStart(self):
        #print the hexagon
        for row in range(self.rows):
            sure = ""
            for column in range(self.columns):
                if self.grid[column][row].outOfBounds == 1:
                    sure = sure + "   "
                else:
                    sure = sure + " " + str(self.grid[column][row].startingPoint) + " "
            print(sure)

    def get_point(self, row, col):
        if 0 <= row < self.num_rows and 0 <= col < self.num_cols:
            return self.grid[col][row]
        else:
            raise IndexError("Row or Column out of bounds")
        
    def setFlags(self, flags):
        for flag in flags:
            print("yeah")


sure = HexagonGrid(5)

print(sure.numCells)

sure.generateMines(5, 8)
sure.singleClickCell(5, 8)
sure.printTest()

# sure.print()

while 2 > 1:
    print("\nColumn Number: ")
    x = input()
    column = int(x)

    print("\nRow Number: ")
    x = input()
    row = int(x)

    sure.flagCell(column, row)
    sure.print()

    sure.unflagCell(column, row)
    sure.print()
    

