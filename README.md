# Vanilla User List

In this project, I challenged myself to use only HTML/CSS/JS features to create a fully web friendly application.

## Features

- `Promise` base `fetch` to get and store user data. This data keeps track of all the chunks of users, which chunk was last loaded, as well as a record of all people that have been loaded
- User cards are created through cloning an HTML `<template>`
- User cards are lazy loaded by splitting the user data into chunks, and an `IntersectionObserver` to observe when the last card is on screen to load the next set of cards
- Scroll animations are applied using another `IntersectionObserver` to see which cards are on screen
- Created a dynamic Neumorphic theme changer, by creating dynamic top and bottom shadows, as well as keeping text legible.
- Search/Filtering on the `Promise`
