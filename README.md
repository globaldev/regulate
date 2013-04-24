# Regulate

Regulate is a library for generating regular expressions in JavaScript code. It grew out of the need for a tool that would allow non-technical users to build up regular expressions for reporting purposes.

It's built on Node but runs pretty much anywhere. To use it in your own projects you can install it via npm:

    npm install regulate
    
Or just include the script in your page:

    <script src="Regulate.min.js"></script>
    
To build the minified script yourself simply clone the repository and run the Grunt build script to generate a *build* directory in the project root:

    grunt uglify
