
# jKwery

 Another command-line jQuery. Written with [node](http://nodejs.org), jQuery and jsdom. Based on the TJ Holowaychuck idea.
 Use `jkwery --help` to get the full supported options.

## Installation

    $ npm install jkwery

    You should have [node.js](https://github.com/joyent/node/wiki/Installation) and [npm](http://npmjs.org/)

## Usage

    $ curl http://test.com/ | jkwery [options] [method [args] | special | selector] ...
    method [args] calls a jQuery method on the current matched elements
    special does some cool stuff (see below, in the future)
    If none of the above matches, assumes this is a selector (eg find selector)
    At the end of the process, outputs innerHTML of matched elements, or not.

## Examples

  Get Google redirection page title:

    $ curl http://google.com/ | jkwery title
    301 Moved

  Twitter logo alt text:
  
    $ curl http://twitter.com | jkwery 'a#logo img' attr alt
    Twitter

  Alternately, since the output is simply more html, we can achieve this same result via pipes:
  
    $ curl http://twitter.com | jkwery 'a#logo' | jkwery img attr alt
    Twitter

  Check if a class is present:
  
    $ curl http://twitter.com | jkwery .article '#timeline' hasClass statuses
    true
    $ echo $?
    1

  Grab width or height attributes:
  
    $ echo '<div class="user" width="300"></div>' | jkwery div.user attr width
    300
    $ echo $?
    300

  Output element text:
  
    $ echo '<p>very <em>slick</em></p>' | jkwery p text
    very slick

  Values:
  
    $ echo '<input type="text" value="your name"/>' | jkwery input val
    your name
  
  Get second li's text:
  
    $ echo '<ul><li>one</li><li>two</li></ul>' | jkwery ul li get 1 text
    two
  
  Get an element outerHTML:
  
    $ echo '<ul><li>one</li><li>two</li></ul>' | jkwery ul li get 0 -o
    <li>one</li>

  Get multiple elements:

    $ echo '<ul><li>one</li><li>two</li></ul>' | jkwery li -o
    <li>one</li>
    <li>two</li>

  Get multiple attributes:

    $ echo '<p lang="fr" /><p lang="en" />' | jkwery p each attr lang
    fr
    en

  Use commas to cope with undesired optional parameters:

    $ echo '<div class="a"></div><div><p>in</p></div><p>out</p>' | jkwery div.a nextAll p -o
    <p>out</p>

    $ echo '<div class="a"></div><div><p>in</p></div><p>out</p>' | jkwery div.a nextAll, p -o
    <p>in</p>

  Use escaping to force a value:

    $ echo '<next />' | jkwery next -o
    
    $ echo '<next />' | jkwery '"next"' -o
    <next></next>

    
