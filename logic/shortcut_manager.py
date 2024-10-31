import os
import json
from logic.file_utils import ensure_directory


class ShortcutManager:
    SHORTCUTS_FILE = "data/shortcuts.json"
    BATCH_FILES_DIR = "data/batch_files"

    def __init__(self):
        ensure_directory(self.BATCH_FILES_DIR)
        # Initialize an empty shortcuts file if it does not exist
        if not os.path.exists(self.SHORTCUTS_FILE):
            with open(self.SHORTCUTS_FILE, "w") as file:
                json.dump({}, file)

    def load_shortcuts(self):
        with open(self.SHORTCUTS_FILE, "r") as file:
            return json.load(file)

    def save_shortcuts(self, shortcuts):
        with open(self.SHORTCUTS_FILE, "w") as file:
            json.dump(shortcuts, file, indent=4)

    def add_shortcut(self, name, details):
        shortcuts = self.load_shortcuts()

        if details['isBatchFile']:
            # Define path for batch file in the dedicated folder
            batch_path = os.path.join(self.BATCH_FILES_DIR, f"{name}.bat")
            # Write batch content to the file
            with open(batch_path, "w") as batch_file:
                batch_file.write(details['batchContent'])
            # Set the action to the batch file path in the details
            details['action'] = batch_path

        # Remove batchContent from details so it is not stored in JSON
        details.pop('batchContent', None)
        shortcuts[name] = details
        self.save_shortcuts(shortcuts)
        return shortcuts

    def delete_shortcut(self, name):
        shortcuts = self.load_shortcuts()
        if name in shortcuts:
            # Delete associated batch file if it exists
            if shortcuts[name].get("isBatchFile"):
                batch_path = shortcuts[name]["action"]
                if os.path.exists(batch_path):
                    os.remove(batch_path)
            del shortcuts[name]
            self.save_shortcuts(shortcuts)
        return shortcuts

    def get_shortcuts(self):
        return self.load_shortcuts()
