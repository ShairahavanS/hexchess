from django.db import models
import json
import random
import uuid


class Cell(models.Model):
    column = models.IntegerField(default=11)
    row = models.IntegerField(default=21)
    key = models.IntegerField(default=-1)
    outofBounds = models.BooleanField(default=False)
    mine = models.BooleanField(default=False)
    revealed = models.BooleanField(default=False)
    flagged = models.BooleanField(default=False)
    adjacent = models.IntegerField(default=0)  # Number of mines adjacent to this cell
    startingPoint = models.BooleanField(default=False)
    honey = models.BooleanField(default=False)

    def reset(self):
        self.mine = False
        self.revealed = False
        self.flagged = False
        self.adjacent = 0
        self.startingPoint = False
        self.honey = False
        self.save()


class Game(models.Model):
    game_ID = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    progress = models.CharField(max_length=5, choices=[("NS", "Not Started"), ("IP", "In Progress"), ("WIN", "Win"), ("LOST", "Lost")], default="NS")
    level = models.CharField(max_length=20, choices=[("Easy", "Easy"), ("Medium", "Medium"), ("Hard", "Hard"), ("Extreme", "Extreme"), ("Impossible", "Impossible")], default="Easy")
    sideLength = models.IntegerField(default=6)
    rows = models.IntegerField(default=11)
    columns = models.IntegerField(default=21)
    numCells = models.IntegerField(default=91)
    mines = models.IntegerField(default=18)
    flags = models.IntegerField(default=18)
    numberRevealed = models.IntegerField(default=73)
    mine_keys = models.JSONField(default=list)
    key_map = models.JSONField(default=dict)  # Use JSONField for key_map
    reverse_key_map = models.JSONField(default=dict)
    board = models.ManyToManyField(Cell)
    
    def deleteCells(self):
        self.board.clear()
        self.save()

        self.board.all().delete()

    def reset_game(self):
        cells = self.board.all()

        for cell in cells:
            cell.reset()
            cell.save()

        self.numberRevealed = self.numCells - self.mines
        self.flags = self.mines
        self.progress = 'NS'

        self.save()

    def create_board(self):

        if self.level == 'Easy':
            self.sideLength = 6
        elif self.level == 'Medium':
            self.sideLength = 10
        elif self.level == 'Hard':
            self.sideLength = 16
        elif self.level == 'Extreme':
            self.sideLength = 24
        elif self.level == 'Impossible':
            self.sideLength = 50
        
        self.columns = 2*self.sideLength - 1
        self.rows = 4*self.sideLength - 3
        self.numCells = ((self.sideLength * 2 - 2) * (self.sideLength * 2 - 1) - (self.sideLength) * (self.sideLength - 1)) + 2 * self.sideLength - 1
        self.mines = int(0.2 * self.numCells)
        self.numberRevealed = self.numCells - self.mines
        self.flags = self.mines
        
        temp_board = [[None for _ in range(self.rows)] for _ in range(self.columns)]

        for col in range(self.columns):
            for row in range(self.rows):
                # Each cell is a dictionary with its attributes
                cell = Cell.objects.create(
                    column=col,
                    row=row,
                    key=-1,
                    mine=False,
                    revealed=False,
                    flagged=False,
                    outofBounds=(row+col)%2 == self.sideLength%2,
                    startingPoint=False,
                    adjacent=0,
                )
                cell.save()
                temp_board[col][row] = cell

        for outer in range(self.sideLength):
            for inner in range(self.sideLength - outer - 1):
                    temp_board[self.columns - 1 - outer][inner].outofBounds = True
                    temp_board[self.columns - 1 - outer][inner].save()
                    temp_board[outer][inner].outofBounds = True
                    temp_board[outer][inner].save()
                    temp_board[outer][self.rows - 1 - inner].outofBounds = True
                    temp_board[outer][self.rows - 1 - inner].save()
                    temp_board[self.columns - 1 - outer][self.rows - 1 - inner].outofBounds = True
                    temp_board[self.columns - 1 - outer][self.rows - 1 - inner].save()

        key = 1

        for column in range(self.columns):
            for row in range(self.rows):
                if not temp_board[column][row].outofBounds:
                    temp_board[column][row].key = key
                    temp_board[column][row].save()
                    self.key_map[key] = (column, row)  # Corrected this line
                    self.reverse_key_map[f"{column},{row}"] = key  # Corrected this line
                    key = key + 1

        # Store the board as a JSON field
        # self.board.set(temp_board)
        self.board.add(*[cell for row in temp_board for cell in row])
        self.save()

    def get_coordinates_from_key(self, key):
        sure = self.key_map.get(str(key))
        return sure
        # return tuple(map(int, sure.split(',')))

    # Function to get key from coordinates (row, col)
    def get_key_from_coordinates(self, col, row):
        return self.reverse_key_map.get(f"{col},{row}")
        # return self.reverse_key_map.get((col, row))
    
    def set_starting_point(self, key): 

        coordinates = self.get_coordinates_from_key(key)
        columnNumber = coordinates[0]
        rowNumber = coordinates[1]

        cell = self.board.filter(column=columnNumber, row = rowNumber).first()
        cell.startingPoint = True
        cell.save()

        if rowNumber - 2 >= 0:  # Ensure we don't go out of bounds
            cell = self.board.filter(column=columnNumber, row=rowNumber-2, outofBounds=False).first()
            if cell:
                cell.startingPoint = True
                cell.save()

        # Down 2 rows
        if rowNumber + 2 < self.rows:  # Ensure we don't go out of bounds
            cell = self.board.filter(column=columnNumber, row=rowNumber+2, outofBounds=False).first()
            if cell:
                cell.startingPoint = True
                cell.save()

        # Top-right diagonal (1 row up, 1 column right)
        if columnNumber + 1 < self.columns and rowNumber - 1 >= 0:  # Check bounds
            cell = self.board.filter(column=columnNumber+1, row=rowNumber-1, outofBounds=False).first()
            if cell:
                cell.startingPoint = True
                cell.save()

        # Bottom-right diagonal (1 row down, 1 column right)
        if columnNumber + 1 < self.columns and rowNumber + 1 < self.rows:  # Check bounds
            cell = self.board.filter(column=columnNumber+1, row=rowNumber+1, outofBounds=False).first()
            if cell:
                cell.startingPoint = True
                cell.save()

        # Top-left diagonal (1 row up, 1 column left)
        if columnNumber - 1 >= 0 and rowNumber - 1 >= 0:  # Check bounds
            cell = self.board.filter(column=columnNumber-1, row=rowNumber-1, outofBounds=False).first()
            if cell:
                cell.startingPoint = True
                cell.save()

        # Bottom-left diagonal (1 row down, 1 column left)
        if columnNumber - 1 >= 0 and rowNumber + 1 < self.rows:  # Check bounds
            cell = self.board.filter(column=columnNumber-1, row=rowNumber+1, outofBounds=False).first()
            if cell:
                cell.startingPoint = True
                cell.save()
    
    def generate_mines(self, key):
        self.set_starting_point(key)

        temp_mines = set()  # use a set for O(1) membership checks

        while len(temp_mines) < self.mines:
            mineKey = random.randint(1, self.numCells)

            # Skip if already chosen
            if mineKey in temp_mines:
                continue

            coordinates = self.get_coordinates_from_key(mineKey)
            columnNumber, rowNumber = coordinates

            # Find a valid cell (not starting point)
            cell = self.board.filter(column=columnNumber, row=rowNumber, startingPoint=False).first()
            if cell:
                cell.mine = True
                cell.save()
                temp_mines.add(mineKey)

            # Convert set to list for JSON serialization
            self.mine_keys = list(temp_mines)


        for columnNumber in range(self.columns):
            for rowNumber in range(self.rows):

                temp_adjacent_counter = 0

                if rowNumber - 2 >= 0:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber-2, outofBounds=False, mine=True).first()
                    if cell:
                        temp_adjacent_counter = temp_adjacent_counter + 1

                # Down 2 rows
                if rowNumber + 2 < self.rows:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber+2, outofBounds=False, mine=True).first()
                    if cell:
                        temp_adjacent_counter = temp_adjacent_counter + 1

                # Top-right diagonal (1 row up, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber-1, outofBounds=False, mine=True).first()
                    if cell:
                        temp_adjacent_counter = temp_adjacent_counter + 1

                # Bottom-right diagonal (1 row down, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber+1, outofBounds=False, mine=True).first()
                    if cell:
                        temp_adjacent_counter = temp_adjacent_counter + 1

                # Top-left diagonal (1 row up, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber-1, outofBounds=False, mine=True).first()
                    if cell:
                        temp_adjacent_counter = temp_adjacent_counter + 1
                
                # Bottom-left diagonal (1 row down, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber+1, outofBounds=False, mine=True).first()
                    if cell:
                        temp_adjacent_counter = temp_adjacent_counter + 1

                cell = self.board.filter(column=columnNumber, row=rowNumber).first()
                cell.adjacent = temp_adjacent_counter
                cell.save()

        self.progress = 'IP'
        self.save()

    def flagCell(self, key):

        if self.progress in ['LOST', 'WON']:
            return
        
        coordinates = self.get_coordinates_from_key(key)
        columnNumber = coordinates[0]
        rowNumber = coordinates[1]

        cell = self.board.filter(column=columnNumber, row=rowNumber, revealed=False).first()
        if cell:
            if cell.flagged == True:
                self.flags += 1
            else:
                self.flags -= 1
            
            self.save()
            cell.flagged = not cell.flagged
            cell.save()
    
    def gameLost(self):
        #reveal all mines
        for items in self.mine_keys:
            coordinates = self.get_coordinates_from_key(items)
            columnNumber = coordinates[0]
            rowNumber = coordinates[1]
            cell = self.board.filter(column=columnNumber, row=rowNumber).first()
            cell.flagged = False
            cell.revealed = True
            cell.save()

        self.progress = 'LOST'
        self.save()

    def checkWon(self):
        # Count safe cells still hidden
        remaining = self.board.filter(revealed=False, outofBounds=False, mine=False).count()

        if remaining == 0:
            self.progress = 'WIN'

            # Mark all mines as honey safely
            for mine_key in self.mine_keys:
                cell = self.board.filter(key=mine_key).first()
                if cell:  # Guard against None
                    cell.honey = True
                    cell.revealed = False
                    cell.save()

            self.save()


    def singleClickCell(self, key):
        coordinates = self.get_coordinates_from_key(key)
        columnNumber = coordinates[0]
        rowNumber = coordinates[1]

        if self.progress == 'NS':
            self.generate_mines(key)

        cell = self.board.filter(column=columnNumber, row=rowNumber, revealed=False, flagged=False).first()

        if not cell:
            dummy = 0
        elif cell.mine:
            self.gameLost()
        elif cell.revealed == False:
            
            cell.revealed = True
            cell.save()
            self.numberRevealed -= 1

            if cell.adjacent == 0:
                if rowNumber - 2 >= 0:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber-2, outofBounds=False).first()
                    if cell:
                        tempKey = self.get_key_from_coordinates(columnNumber, rowNumber-2)
                        self.singleClickCell(tempKey)

                # Down 2 rows
                if rowNumber + 2 < self.rows:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber+2, outofBounds=False).first()
                    if cell:
                        tempKey = self.get_key_from_coordinates(columnNumber, rowNumber+2)
                        self.singleClickCell(tempKey)

                # Top-right diagonal (1 row up, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber-1, outofBounds=False).first()
                    if cell:
                        tempKey = self.get_key_from_coordinates(columnNumber+1, rowNumber-1)
                        self.singleClickCell(tempKey)

                # Bottom-right diagonal (1 row down, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber+1, outofBounds=False).first()
                    if cell:
                        tempKey = self.get_key_from_coordinates(columnNumber+1, rowNumber+1)
                        self.singleClickCell(tempKey)

                # Top-left diagonal (1 row up, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber-1, outofBounds=False).first()
                    if cell:
                        tempKey = self.get_key_from_coordinates(columnNumber-1, rowNumber-1)
                        self.singleClickCell(tempKey)

                # Bottom-left diagonal (1 row down, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber+1, outofBounds=False).first()
                    if cell:
                        tempKey = self.get_key_from_coordinates(columnNumber-1, rowNumber+1)
                        self.singleClickCell(tempKey)

            self.checkWon()

        self.checkWon()
        self.save()

    def doubleClickCell(self, key):

        coordinates = self.get_coordinates_from_key(key)
        columnNumber = coordinates[0]
        rowNumber = coordinates[1]
        clickedCell = self.board.filter(column=columnNumber, row=rowNumber, revealed=True).first()

        if clickedCell:
            flagCount = 0

            if rowNumber - 2 >= 0:  # Ensure we don't go out of bounds
                cell = self.board.filter(column=columnNumber, row=rowNumber-2, outofBounds=False, flagged=True).first()
                if cell:
                    flagCount += 1

            # Down 2 rows
            if rowNumber + 2 < self.rows:  # Ensure we don't go out of bounds
                cell = self.board.filter(column=columnNumber, row=rowNumber+2, outofBounds=False, flagged=True).first()
                if cell:
                    flagCount += 1

            # Top-right diagonal (1 row up, 1 column right)
            if columnNumber + 1 < self.columns and rowNumber - 1 >= 0:  # Check bounds
                cell = self.board.filter(column=columnNumber+1, row=rowNumber-1, outofBounds=False, flagged=True).first()
                if cell:
                    flagCount += 1

            # Bottom-right diagonal (1 row down, 1 column right)
            if columnNumber + 1 < self.columns and rowNumber + 1 < self.rows:  # Check bounds
                cell = self.board.filter(column=columnNumber+1, row=rowNumber+1, outofBounds=False, flagged=True).first()
                if cell:
                    flagCount += 1

            # Top-left diagonal (1 row up, 1 column left)
            if columnNumber - 1 >= 0 and rowNumber - 1 >= 0:  # Check bounds
                cell = self.board.filter(column=columnNumber-1, row=rowNumber-1, outofBounds=False, flagged=True).first()
                if cell:
                    flagCount += 1

            # Bottom-left diagonal (1 row down, 1 column left)
            if columnNumber - 1 >= 0 and rowNumber + 1 < self.rows:  # Check bounds
                cell = self.board.filter(column=columnNumber-1, row=rowNumber+1, outofBounds=False, flagged=True).first()
                if cell:
                    flagCount += 1

            if flagCount == clickedCell.adjacent:
                incorrectFlag = False

                if rowNumber - 2 >= 0:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber-2, outofBounds=False, flagged=True, mine=False).first()
                    if cell:
                        incorrectFlag = True

                # Down 2 rows
                if rowNumber + 2 < self.rows:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber+2, outofBounds=False, flagged=True, mine=False).first()
                    if cell:
                        incorrectFlag = True

                # Top-right diagonal (1 row up, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber-1, outofBounds=False, flagged=True, mine=False).first()
                    if cell:
                        incorrectFlag = True

                # Bottom-right diagonal (1 row down, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber+1, outofBounds=False, flagged=True, mine=False).first()
                    if cell:
                        incorrectFlag = True

                # Top-left diagonal (1 row up, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber-1, outofBounds=False, flagged=True, mine=False).first()
                    if cell:
                        incorrectFlag = True

                # Bottom-left diagonal (1 row down, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber+1, outofBounds=False, flagged=True, mine=False).first()
                    if cell:
                        incorrectFlag = True

            if incorrectFlag:

                if rowNumber - 2 >= 0:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber-2, outofBounds=False, revealed=False).first()
                    if cell:
                        cell.revealed = True
                        cell.save()

                # Down 2 rows
                if rowNumber + 2 < self.rows:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber+2, outofBounds=False, revealed=False).first()
                    if cell:
                        cell.revealed = True
                        cell.save()

                # Top-right diagonal (1 row up, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber-1, outofBounds=False, revealed=False).first()
                    if cell:
                        cell.revealed = True
                        cell.save()

                # Bottom-right diagonal (1 row down, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber+1, outofBounds=False, revealed=False).first()
                    if cell:
                        cell.revealed = True
                        cell.save()

                # Top-left diagonal (1 row up, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber-1, outofBounds=False, revealed=False).first()
                    if cell:
                        cell.revealed = True
                        cell.save()

                # Bottom-left diagonal (1 row down, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber+1, outofBounds=False, revealed=False).first()
                    if cell:
                        cell.revealed = True
                        cell.save()

                self.gameLost()

            else:
                if rowNumber - 2 >= 0:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber-2, outofBounds=False, flagged=False, revealed=False).first()
                    if cell:
                        tempkey = cell.key
                        self.singleClickCell(tempkey)

                # Down 2 rows
                if rowNumber + 2 < self.rows:  # Ensure we don't go out of bounds
                    cell = self.board.filter(column=columnNumber, row=rowNumber+2, outofBounds=False, flagged=False, revealed=False).first()
                    if cell:
                        tempkey = cell.key
                        self.singleClickCell(tempkey)

                # Top-right diagonal (1 row up, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber-1, outofBounds=False, flagged=False, revealed=False).first()
                    if cell:
                        tempkey = cell.key
                        self.singleClickCell(tempkey)

                # Bottom-right diagonal (1 row down, 1 column right)
                if columnNumber + 1 < self.columns and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber+1, row=rowNumber+1, outofBounds=False, flagged=False, revealed=False).first()
                    if cell:
                        tempkey = cell.key
                        self.singleClickCell(tempkey)

                # Top-left diagonal (1 row up, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber - 1 >= 0:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber-1, outofBounds=False, flagged=False, revealed=False).first()
                    if cell:
                        tempkey = cell.key
                        self.singleClickCell(tempkey)

                # Bottom-left diagonal (1 row down, 1 column left)
                if columnNumber - 1 >= 0 and rowNumber + 1 < self.rows:  # Check bounds
                    cell = self.board.filter(column=columnNumber-1, row=rowNumber+1, outofBounds=False, flagged=False, revealed=False).first()
                    if cell:
                        tempkey = cell.key
                        self.singleClickCell(tempkey)

        self.checkWon()
        self.save()