
# jKwery

 Another command-line jQuery. Written with [node](http://nodejs.org), jQuery and jsdom. Based on the TJ Holowaychuck idea.
 Use `jkwery --help` to get the full supported options.

## Installation

    $ npm install jkwery

## Usage

    $ curl http://test.com/ | jkwery [options] [method [args] | attr | selector] ...
    method [args] calls a jQuery method on the current elements
    attr returns this attribute of the matched elements, one per line
    If none of the above matches, assumes this is a selector (eg find selector)
    At the end of the process, if no attr was present, outputs innerHTML of current elements

## Examples

  Twitter logo alt text:
  
    $ curl http://twitter.com | jkwery 'a#logo img' attr alt
    Twitter

  Alternately, since the output is simply more html, we can achieve this same result via pipes:
  
    $ curl http://twitter.com | jkwery 'a#logo' | jkwery img attr alt
    Twitter

  Check if a class is present:
  
    $ curl http://twitter.com | jkwery .article '#timeline' hasClass statuses
    true

  Grab width or height attributes:
  
    $ echo '<div class="user" width="300"></div>' | jkwery div.user width
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

