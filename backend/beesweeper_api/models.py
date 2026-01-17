from django.db import models
import json
import random
import uuid
from collections import deque


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

    def start_change_tracking(self):
        self._changed_cells = set()

    def mark_changed(self, cell):
        self._changed_cells.add(cell.id)

    def get_changed_cells(self):
        return self.board.filter(id__in=self._changed_cells)
    
    def deleteCells(self):
        self.board.clear()
        self.save()

        self.board.all().delete()

    def reset_game(self):
        cells = self.board.all()

        for cell in cells:
            cell.reset()

        self.numberRevealed = self.numCells - self.mines
        self.flags = self.mines
        self.progress = 'NS'

        self.save()

    def create_board(self):

        # -----------------------------
        # Board size logic (unchanged)
        # -----------------------------
        if self.level == 'Easy':
            self.sideLength = 6
        elif self.level == 'Medium':
            self.sideLength = 10
        elif self.level == 'Hard':
            self.sideLength = 14
        elif self.level == 'Extreme':
            self.sideLength = 18
        elif self.level == 'Impossible':
            self.sideLength = 24

        self.columns = 2 * self.sideLength - 1
        self.rows = 4 * self.sideLength - 3
        self.numCells = ((self.sideLength * 2 - 2) * (self.sideLength * 2 - 1)
                        - (self.sideLength) * (self.sideLength - 1)) + 2 * self.sideLength - 1
        self.mines = int(0.2 * self.numCells)
        self.numberRevealed = self.numCells - self.mines
        self.flags = self.mines

        # --------------------------------------------------
        # OPTIMIZED: create all Cell objects IN MEMORY
        # --------------------------------------------------
        cells = []
        cell_map = {}  # (col, row) -> Cell

        for col in range(self.columns):
            for row in range(self.rows):

                cell = Cell(
                    column=col,
                    row=row,
                    key=-1,
                    mine=False,
                    revealed=False,
                    flagged=False,
                    outofBounds=(row + col) % 2 == self.sideLength % 2,
                    startingPoint=False,
                    adjacent=0,
                )
                cells.append(cell)
                cell_map[(col, row)] = cell

        # --------------------------------------------------
        # OPTIMIZED: single DB insert
        # --------------------------------------------------
        Cell.objects.bulk_create(cells, batch_size=1000)

        # --------------------------------------------------
        # OPTIMIZED: update out-of-bounds in memory
        # --------------------------------------------------
        for outer in range(self.sideLength):
            for inner in range(self.sideLength - outer - 1):
                cell_map[(self.columns - 1 - outer, inner)].outofBounds = True
                cell_map[(outer, inner)].outofBounds = True
                cell_map[(outer, self.rows - 1 - inner)].outofBounds = True
                cell_map[(self.columns - 1 - outer, self.rows - 1 - inner)].outofBounds = True

        # --------------------------------------------------
        # OPTIMIZED: assign keys + key maps (NO saves)
        # --------------------------------------------------
        key = 1
        self.key_map = {}
        self.reverse_key_map = {}

        for col in range(self.columns):
            for row in range(self.rows):
                cell = cell_map[(col, row)]
                if not cell.outofBounds:
                    cell.key = key
                    self.key_map[str(key)] = [col, row]   # OPTIMIZED: JSON-safe
                    self.reverse_key_map[f"{col},{row}"] = key
                    key += 1

        # --------------------------------------------------
        # OPTIMIZED: bulk update instead of per-cell save
        # --------------------------------------------------
        Cell.objects.bulk_update(
            cells,
            ["outofBounds", "key"],
            batch_size=1000
        )

        # --------------------------------------------------
        # OPTIMIZED: single M2M add
        # --------------------------------------------------
        self.board.add(*cells)
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

        # --------------------------------------------------
        # OPTIMIZED: preload board into memory
        # --------------------------------------------------
        cells = list(self.board.all())
        cell_map = {(c.column, c.row): c for c in cells}

        temp_mines = set()

        # --------------------------------------------------
        # OPTIMIZED: mine placement without DB queries
        # --------------------------------------------------
        while len(temp_mines) < self.mines:
            mineKey = random.randint(1, self.numCells)
            if mineKey in temp_mines:
                continue

            col, row = self.get_coordinates_from_key(str(mineKey))
            cell = cell_map[(col, row)]

            if not cell.startingPoint:
                cell.mine = True
                temp_mines.add(mineKey)

        self.mine_keys = list(temp_mines)

        # --------------------------------------------------
        # OPTIMIZED: adjacency calculation (pure Python)
        # --------------------------------------------------
        directions = [
            (0, -2), (0, 2),
            (1, -1), (1, 1),
            (-1, -1), (-1, 1),
        ]

        for cell in cells:
            if cell.outofBounds:
                continue

            count = 0
            for dx, dy in directions:
                neighbor = cell_map.get((cell.column + dx, cell.row + dy))
                if neighbor and neighbor.mine:
                    count += 1

            cell.adjacent = count

        # --------------------------------------------------
        # OPTIMIZED: one bulk update
        # --------------------------------------------------
        Cell.objects.bulk_update(
            cells,
            ["mine", "adjacent"],
            batch_size=1000
        )

        self.progress = 'IP'
        self.save()

    def flagCell(self, key):

        if self.progress in ['LOST', 'WIN']:
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
            self.mark_changed(cell)
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
            self.mark_changed(cell)
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
                    self.mark_changed(cell)
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
            self.mark_changed(cell)
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

            if flagCount != clickedCell.adjacent:
                dummy = 0
            else:
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