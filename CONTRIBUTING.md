# Contributing to Regulate

Firstly, thanks for wanting to contribute! Regulate is still a work-in-progress and there may be any number of bugs and missing functionality that you may want to help fix and/or add.

This short guide should tell you all you need to know to start submitting patches.

## Getting a local copy

Obviously the first step is to fork the Regulate repository to your own GitHub account and then check it out to your local machine. Once you've done that, you need to install the development dependencies, so run this from inside the clone directory:

    npm install

You'll also need Grunt 0.4 or above, so if you don't have it already you'll need to run this:

    npm install -g grunt-cli

## Writing code

The number one rule is to simply follow the existing style. This is enforced to a point by JSHint. Please make sure your changes pass JSHint with the correct option set applied. You can check this at any time from the terminal:

    grunt jshint

Once you're happy with your patch please make sure all existing unit tests still pass, and add any tests for new functionality. Before submitting your patch it's strongly recommended that you run the build script in full:

    grunt