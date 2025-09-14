# Feature: Save and Share Recipe
Once a recipe has been converted, with the convert feature, the user should be able to share it with their friends. It should go roughly like this:
*A unique ID is generated consisting of 8 characters in a URL safe way, similar to PasteBin. This ID will be used for both storage and url.
*The recipe is stored in using Prisma (SQLite for local storage, whatever Vercel is using, when published) with it's id, raw text, converted text (markdown) and a timestamp.
*The user is redirected to a link representing the stored recipe (e.g. ~/r/fk5KKfg4) where they can see the recipe and click a "Share" button to copy the URL.

Note: In the unlikely case of conflicting ID's the flow should reroll the ID, but first check that it isn't because that exact recipe has already been posted.