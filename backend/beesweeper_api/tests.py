from django.test import TestCase
from .models import Game, Cell
import json

class GameModelTest(TestCase):

    def test_create_board(self):
        # Create a Game object
        game = Game.objects.create(
            game_ID=1,
            progress='NS',
            level='Easy',  # Choose any level (Easy, Medium, etc.)
            sideLength=6,
            rows=11,
            columns=21,
            numCells=91,
            mines=18,
            flags=18,
            numberRevealed=0
        )

        # Call create_board method to generate the board
        game.create_board()

        # Check if the 'board' field contains the expected structure
        self.assertIsInstance(game.board, list)  # Board should be a list
        self.assertGreater(len(game.board), 0)  # Board list should not be empty

        # Check that each item in the board is a dictionary with the expected keys
        for col_cells in game.board:
            for cell in col_cells:
                self.assertIsInstance(cell, dict)
                self.assertIn('row', cell)
                self.assertIn('column', cell)
                self.assertIn('key', cell)
                self.assertIn('outofBounds', cell)
                self.assertIn('mine', cell)
                self.assertIn('revealed', cell)
                self.assertIn('flagged', cell)
                self.assertIn('adjacent', cell)

        # Optionally: Check if the first cell has the expected values
        first_cell = game.board[0][0]  # This assumes the board is a list of lists
        self.assertEqual(first_cell['row'], 0)
        self.assertEqual(first_cell['column'], 0)
        self.assertEqual(first_cell['key'], -1)
        self.assertEqual(first_cell['outofBounds'], False)
        self.assertEqual(first_cell['mine'], False)
        self.assertEqual(first_cell['revealed'], False)
        self.assertEqual(first_cell['flagged'], False)
        self.assertEqual(first_cell['adjacent'], 0)

