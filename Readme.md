
# XQuery

 jQuery for the command-line. Written with [node](http://nodejs.org), jQuery and jsdom. Based on query from TJ Holowaychuck.
 Use xquery --help to get the full supported options.

## Installation

    $ npm install xquery

## Usage

    $ curl http://test.com/ | xquery [--explain] [method [args] | attr | special | selector] ...
    method [args] calls a jQuery method on the current elements
    attr returns this attribute of the matched elements, one per line
    special can be 'outerHTML' to get the outerHTML instead of the innerHTML (see below)
    If none of the above matches, assumes this is a selector (eg find selector)
    At the end of the process, if no attr was present, outputs innerHTML of current elements

## Examples

  Twitter logo alt text:
  
    $ curl http://twitter.com | xquery 'a#logo img' attr alt
    Twitter

  Alternately, since the output is simply more html, we can achieve this same result via pipes:
  
    $ curl http://twitter.com | xquery 'a#logo' | xquery img attr alt
    Twitter

  Check if a class is present:
  
    $ curl http://twitter.com | xquery .article '#timeline' hasClass statuses
    true

  Grab width or height attributes:
  
    $ echo '<div class="user" width="300"></div>' | xquery div.user width
    300

  Output element text:
  
    $ echo '<p>very <em>slick</em></p>' | xquery p text
    very slick

  Values:
  
    $ echo '<input type="text" value="your name"/>' | xquery input val
    your name
  
  Get second li's text:
  
    $ echo $list | xquery ul li get 1 text
    two
  
  Get third li's text using `next`:
  
    $ echo $list | xquery ul li get 1 next text
    three
