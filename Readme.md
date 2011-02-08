
# Query

 jQuery for the command-line, written with [node](http://nodejs.org), jQuery of course, and jsdom.

## Installation

    $ npm install query

## Examples

  Twitter logo alt text:
  
    $ curl http://twitter.com | query 'a#logo img' attr alt
    Twitter
