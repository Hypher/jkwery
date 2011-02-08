
# Query

 jQuery for the command-line, written with [node](http://nodejs.org), jQuery of course, and jsdom.

## Installation

    $ npm install query

## Examples

  Twitter logo alt text:
  
    $ curl http://twitter.com | query 'a#logo img' attr alt
    Twitter

  Alternately, since the output is simply more html, we can achieve this same result via pipes:
  
    $ curl http://twitter.com | query 'a#logo' | query img attr alt
    Twitter

  Check if a class is present:
  
    $ curl http://twitter.com | query .article '#timeline' hasClass statuses
    true