let monacoEditorLoaded = false;

function loadMonacoEditor() {
    if (!monacoEditorLoaded) {
        require.config({paths: {'vs': './monaco-editor/min/vs'}});
        require(['vs/editor/editor.main'], function () {
            window.monacoEditor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
                value: '',
                language: 'bat',
                theme: 'vs-dark'
            });
            monacoEditorLoaded = true;
        });
    }
}

// State variables
let isScanning = false;
let keysPressed = new Set();
let batchContent = ""

// DOM Elements
const shortcutInput = document.getElementById("shortcut");
const shortcutList = document.getElementById("shortcutList");
const nameInput = document.getElementById("name");
const actionInput = document.getElementById("batch");
const creationDialog = document.getElementById("creationDialog");

// Event Listeners
shortcutInput.addEventListener("focus", startShortcutScan);
shortcutInput.addEventListener("blur", stopShortcutScan);
document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);

// Shortcut scan functions
function startShortcutScan() {
    isScanning = true;
    keysPressed.clear();
    shortcutInput.focus();
    shortcutInput.value = "Press shortcut keys";
}

function stopShortcutScan() {
    isScanning = false;
    keysPressed.clear();
}

function handleKeydown(event) {
    if (isScanning) {
        event.preventDefault();
        keysPressed.add(event.key);
        shortcutInput.value = Array.from(keysPressed).join(" + ");
    }
}

function handleKeyup() {
    shortcutInput.blur();
    stopShortcutScan()
}

async function addShortcut() {
    const name = document.getElementById("name").value;
    const keys = document.getElementById("shortcut")?.value || "-''-";
    const path = document.getElementById("batch")?.value || "-''-";

    if (!name) {
        alert("Please fill out all fields.");
        return;
    }

    let details = {keys, path};
    const shortcutItem = createShortcutListItem(name, details);
    shortcutList.appendChild(shortcutItem);
    await eel.add_shortcut(name, details)();
    // Clear inputs
    resetForm();
    closeCreationDialog();
}

async function deleteShortcut(name) {
    const shortcuts = await eel.delete_shortcut(name)();
    renderShortcuts(shortcuts);
}

async function loadShortcuts() {
    const shortcuts = await eel.get_shortcuts()();
    renderShortcuts(shortcuts);
}

function renderShortcuts(shortcuts) {
    shortcutList.innerHTML = "";
    for (const [name, details] of Object.entries(shortcuts)) {
        const item = createShortcutListItem(name, details);
        shortcutList.appendChild(item);
    }
}

function createShortcutListItem(name, {keys, value, isPath}) {
    const item = document.createElement("tr");
    item.innerHTML = `
        <td>${name}</td> 
        <td>${keys}</td>
        <td>${isPath}</td>
        <td> 
            <button onclick="deleteShortcut('${name}')">Delete</button>
        </td>
    `;
    return item;
}

// Form reset and modal functions
function resetForm() {
    document.getElementById("name").value = "";
    const shortcut = document.getElementById("shortcut")
    if (shortcut.value) {
        shortcut.value = "";
    }

    const batchPath = document.getElementById("batch");
    if (batchPath.value) {
        batchPath.value = "";
    }
}

function editShortcut(action) {
    openCreationDialog();
    nameInput.value = action;
    shortcutInput.value = "";
    actionInput.value = action;
    const batchFileNameInput = document.getElementById("batchFileName");
    batchFileNameInput.readOnly = true;
}

function openBatchEditor() {
    loadMonacoEditor();
    if (window.monacoEditor) {
        window.monacoEditor.setValue(batchContent);
    }
}

function validateForm() {
    const name = document.getElementById("name").value;
    const addButton = document.getElementById("addShortcutButton");
    addButton.disabled = (!(name));
}

function openCreationDialog() {
    creationDialog.showModal();
    openBatchEditor()
    validateForm();
}

function closeCreationDialog() {
    creationDialog.close();
}


loadShortcuts().catch(error => console.error("Failed to load shortcuts:", error));