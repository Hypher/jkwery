
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

  Grab width or height attributes:
  
    $ echo '<div class="user" width="300"></div>' | query div.user width
    300

  Output element text:
  
    $ echo '<p>very <em>slick</em></p>' | query p text
    very slick

  Values:
  
    $ echo '<input type="text" value="tj@vision-media.ca"/>' | query input val
    tj@vision-media.ca
  
  Get second li's text:
  
    $ echo $list | query ul li get 1 text
    two
  
  Get third li's text using `next`:
  
    $ echo $list | query ul li get 1 next text
    three