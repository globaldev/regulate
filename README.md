# Regulate

Regulate is a library for generating regular expressions in JavaScript code. It grew out of the need for a tool that would allow non-technical users to build up regular expressions for reporting purposes.

It's built on Node but runs pretty much anywhere. To use it in your own projects you can install it via npm:

    npm install regulate
    
Or just include the script in your page:

    <script src="Regulate.min.js"></script>
    
To build the minified script yourself simply clone the repository and run the Grunt build script to generate a *build* directory in the project root:

    grunt uglify

## Usage

Regulate exposes a single global function, `Regulate`. It's effectively a factory function that returns an instance. Almost all of the Regulate instance methods return the same instance to allow for chaining. Here's a simple example that builds a regular expression to match a 3-16 character "username" made up of lower-case characters, underscores and digits:

```javascript
var rxUser = Regulate().start().charIn(["a", "z"], [0, 9], "_").repeat(3, 16).end();
rxUser.toString(); // '^[a-z0-9_]{3, 16}$'
```

For details of all the available methods have a look at [the API](https://github.com/globaldev/regulate/wiki/API).

## Contributing

If you would like to contribute to Regulate please have a look at the contribution guidelines. You'll need Grunt 0.4 or above to develop Regulate locally. Thanks, and we look forward to your patches!
