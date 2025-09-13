# Feature: Convert pasted recipe using AI
One of the main features of the app is the ability to paste a recipe without considering formatting or structure. 
The main page must have a two-tab setup:
1. A tab which contains an input field where text can be pasted. There shall also be a button for formatting the text. Clicking this button will use the OpenAI API to convert the recipe to match some examples. The examples are included in the system prompt text, which can be found in 'system-message.txt'.
2. A tab which displays the formatted recipe (once available). After the user clicks the format button, they will be taken here automatically. If they access the tab before a recipe has been formatted, it will contain a message explaining that they need to paste and format a recipe in the first tab.

