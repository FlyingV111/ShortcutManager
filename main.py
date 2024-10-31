import eel
from logic.shortcut_manager import ShortcutManager

eel.init("web")
manager = ShortcutManager()


@eel.expose
def add_shortcut(name, details):
    return manager.add_shortcut(name, details)


@eel.expose
def delete_shortcut(name):
    return manager.delete_shortcut(name)


@eel.expose
def get_shortcuts():
    return manager.get_shortcuts()


eel.start("index.html", size=(800, 500), resizeable=False)
