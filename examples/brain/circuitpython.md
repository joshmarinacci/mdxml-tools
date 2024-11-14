# CircuitPython Brain


## files

### Load JSON from disk

```json
{
	"foo":{
		"bar":"baz"
	}
}
```

```python
config = json.load(open("config.json",'rb'))
print(config['foo']['bar'])
```

### read text file to string

```python
with open("./blog.html", "r") as txt:
    html = txt.read()
```


### unit tests

```python
import unittest

class BasicParsing(unittest.TestCase):
    def test_thing(self):
        self.assertEqual("foo","bar")

if __name__ == '__main__':
    unittest.main()

```



## display io


### Terminal

```python
import terminalio
import displayio

# size of font glyph
fontx, fonty = terminalio.FONT.get_bounding_box()

# adjust palette if desired
plain_palette = displayio.Palette(2)
plain_palette[0] = 0x000000
plain_palette[1] = 0x33ff33

# create grid using the font 
# width and height in tiles
# x and y in pixels
pgrid = displayio.TileGrid(terminalio.FONT.bitmap,
                           x=0,
                           y=0,
                           width=display.width // fontx,
                           height=display.height // fonty,
                           tile_width=fontx,
                           tile_height=fonty,
                           pixel_shader=plain_palette)

# terminal attached to the tilegrid
ptermx = terminalio.Terminal(pgrid, terminalio.FONT)

# add to the screen
display.root_group.append(pgrid)
```

Print to the terminal with `print`:

```python
# with newline
print("some text", file=ptermx, end="\r\n")

# without newline
print("some text", file=ptermx, end="")
```





[CircuitPython Tricks](https://github.com/todbot/circuitpython-tricks)

# QT Py (not the rp2040 version)
* [learn page](https://learn.adafruit.com/adafruit-qt-py)
* get into boot loader mode with double click on the reset button.
* asyncio is not supported on SAMD21 boards due to lack of storage and RAM.


# KB2040:
* [learn page](https://learn.adafruit.com/adafruit-kb2040)
* [pinout PDF](https://github.com/adafruit/Adafruit-KB2040-PCB/blob/main/Adafruit%20KB2040%20Pinout.pdf)
* [CircuitPython firmware download](https://circuitpython.org/board/adafruit_kb2040/)
* It does support AsyncIO.
*



# Fritzing
* [Import Adafruit Libs ](https://learn.adafruit.com/using-the-adafruit-library-with-fritzing/import-the-library-into-fritzing?gclid=Cj0KCQjwwtWgBhDhARIsAEMcxeADhWRGuGPcspoAPKQmXJ8TVPZ0VM0u8KoTB3iH9cKsKLqb7ajuA0QaAn2tEALw_wcB)
* [Using the Adafruit Library with Fritzing](https://learn.adafruit.com/using-the-adafruit-library-with-fritzing)
* for some reason Fritzing is still open source but charges you to download it.




### reference board pins by string name


```python
pin = board.D0 
# or
pin = getattr(board,'D0')
```



# convert a PNG to a indexed color bitmap

```shell
convert digits.png -colors 64 -type palette -compress None BMP3:digits.bmp
```

# use a custom font in a label or button

[Overview | Custom Fonts for CircuitPython Displays | Adafruit Learning System](https://learn.adafruit.com/custom-fonts-for-pyportal-circuitpython-display/overview)
### Convert  truetype font to bitmap
```shell
brew install otf2bdf
otf2bdf FontFile.ttf -p pointsize -o FontFile.bdf
```

### convert bitmap ascii to bitmap binary
[bdftopcf font converter](https://adafruit.github.io/web-bdftopcf/)

### Use in python code

```python
from adafruit_display_text import label
from adafruit_bitmap_font import bitmap_font

font = bitmap_font.load_font("my_font.bdf")
# draw in red
text_label = label.Label(font, text="Greetings Earthling!", color=0xFF0000)

```


## shorts
* turn an exception into an array of strings with `traceback.format_exception(e)`
* format an array of strings into a single string with `”some string”.join(arr)`.
* catch an exception:

```python
    try:
        save_pixels('/screenshot.bmp',pixel_source=display)
        logger.info("saved the screenshot")
    except Exception as e:
        logger.error("couldnt take screenshot")
        logger.error(''.join(traceback.format_exception(e)))

```

# logging
The logger framework lets you set log levels and send your logs to multiple outputs. There is a FileHandler class that will log to a file, however it does not flush automatically. I’m not sure when it **ever** flushes, actually, which is a problem for long running processes that only log occasionally.  so I created my own JoshFileHandler that flushes after every log.


## visual logging
[terminalio – Displays text in a TileGrid — Adafruit CircuitPython 8.2.0-rc.0 documentation](https://docs.circuitpython.org/en/latest/shared-bindings/terminalio/index.html)

[Using plain terminalio with displayio - ValueError: Tile index out of bounds · Issue #7885 · adafruit/circuitpython · GitHub](https://github.com/adafruit/circuitpython/issues/7885)



# Circup failure
If the latest build of CP is bad for some reason, Circup can fail because it will always try to download the latest release. There should be an option to not check for the latest release. If you are installing a lib then you probably want the version of that lib that matches the CP on your board. Something like this:

```shell
circup --use-current-version install adafruit_bitmapsaver
```


MF-1304:~ josh.marinacci$ cp ~/Downloads/adafruit-circuitpython-bundle-8.x-mpy-20230524/lib/adafruit_bitmapsaver.mpy *Volumes/CIRCUITPY/lib*




# icon fonts
I could convert an icon font to a BDF but it would likely be too big. I want to create a subset instead. OTF2BDF has a subset option but first I need to know what glyphs are in the font I want to convert.  Using the numbers provided by Google Fonts didn’t work. Maybe not in hex?


pip install
https://fonttools.readthedocs.io/en/latest/index.html
to output a font with just the heart icon:
pyftsubset ~/Downloads/MaterialIcons-Regular.ttf --unicodes="U+e87d" --no-ignore-missing-unicodes --output-file=foo.ttf
to output a font with just hte heart and battery icons
—unicodes=“U+e87d,e1a3”

Use font tools, a set of python tools to subset the font, then convert it to BDF:

Export a font with only the letter A in it
```shell
pip install fonttools
pyftsubset input.ttf --unicodes="U+0040" --no-ignore-missing-unicodes --output-file='output.ttf'
otf2bdf output.ttf -o output.bdf -p 16
```

To convert the material icons font with just the heart and battery charging icons, which are at `U+E87D` and `U+E1A3` do

```shell
pyftsubset ~/Downloads/MaterialIcons-Regular.ttf --unicodes="U+e87d, e1a3" --no-ignore-missing-unicodes --output-file=output.ttf
otf2bdf output.ttf -o output.bdf -p 16
```


In your python code, load the font into a label and set the text with unicode glyphs:




# Fonts and Icons on Circuit Python
I’m continuing to work on a little smartwatch prototype using a little round LCD (as I talked about here). I want to have nice looking text. The default font for CircuitPython is fine, but it’s very tiny. This LCD has a pretty high DPI compared to other hobbyist screens( **> 200 ppi**), so I need to find a new font.  CP has a way of importing new fonts, but there are a few pitfalls and tricks I discovered, so that’s what I’m covering today.

Adafruit has a guide **here** to using custom fonts on CircuitPython. It only supports bitmap fonts, so you’ll need a font converted to BDF (ascii) or BDC (binary) **links**.  Modern fonts are vectors in TrueType (TTF), OpenType, or web font formats. So we’ll need a converter. The command line program otf2bdf is such a converter. If you’ve already downloaded a TrueType font locally you can convert it like this. I’m using MacOS but similar should work on Windows and Linux.

First install otf2bdf with brew, apt-get, or the install program of your choice

```shell
brew install otf2bdf
```

Now convert the font to bitmap at a specific point height. I’m using 16pt.

```shell
otfbdf SomeFont.ttf -o cpfont.bdf -p 16
```


Now copy the output bitmap font to your CircuitPython device and use it in code like this:
```python
from adafruit_bitmap_font import bitmap_font
from adafruit_display_text.bitmap_label import Label
font = bitmap_font.load_font("cpfont.bdf")
label = Label(
    font=font,
    text='Text in a nice Font',
)
```

And that’s it.  Pretty easy.

# icon fonts
Now let’s suppose you want some nice icons. You could download each icon as PNG or SVG and then convert to CircuitPython’s preferred BMP format, but icon fonts are a thing. Let’s use them.

Google created the [Material icon font](https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0) for use across all of Android and the Web. They are completely open source and have icons for pretty much everything. We can’t use it directly, however, because it’s in what’s known as a Variable Webfont, which can have multiple weights and styles in a single file. Instead we want the static truetype fonts from [GitHub here](https://github.com/google/material-design-icons/tree/master/font).   I chose the font called **name**.

When you download a single Material icon font you’ll see that it is huge. 348KB for a single weight.  That’s because it contains over 3000 icons! 348KB is too big for our little RP2040 that has less than 200KB.  Of course we don’t need all 3000 icons. In most cases only 5 or ten of them. We need a way to subset the font.

If you select an icon back on the [Material Symbol Font webpage](https://fonts.google.com/icons) a sidebar will appear on the right. At the very bottom it will list the **code point** of that particular icon. That’s what you need. Write down this code point, and the points of any other icons you want to extract. For my example I want the icons for Settings (e8b8),  Battery Full (e1a4), and Timer (e425).

Now we will use a python program called pyftsubset that knows how to subset fonts. It is part of the [font-tools](https://fonttools.readthedocs.io/en/latest/index.html). Install font tools with pip then run pyftsubset to make sure it’s installed correctly.

```shell
pip install fonttools
pyftsubset --help
```

Now let’s create a new icon font with a subset of the Material Symbol Font containing only the glyphs we want.

```shell
pyftsubset MaterialIcons-Regular.ttf --unicodes="U+e8b8,e1a4,e425" --no-ignore-missing-unicodes --output-file=icons.ttf
```

Note: The `--no-ignore-missing-unicodes` option will print an error if we typed in a code that doesn’t exist in the font. The resulting font is still in truetype format, so we need to convert to bitmap to use it.

```shell
otfbdf icons.ttf -o icons.bdf -p 16
```

And now we can use it in our program.  Here it is on my prototype device.

C’est magnifique









# gfx work
These little SPI screens sometimes have a vertical scroll mode.  This is not exposed by the CP driver, but we can manually send commands if we want. We must setup the vertical scrolling area by sending VSCRDEF (0x33) with the distance from the top of the screen to the top of the scrolling area, then the height of the scrolling area.

Then, when we want to scroll, we send VSCSAD (0x37) with a scroll start point. Setting the start point to the top of the scroll area will make it look like it’s not scrolled at all. Then you can keep adding to the scroll offset to draw further down.

This lets us continuously scroll part of the screen, but it doesn’t let us draw new content. Every part of the scrolling area is visible at all times.  What we can do is draw the bottom line of the scroll area with new content, then scroll it up.

If the new line is going to be at scroll 100, then draw a line there and it will join the scroll going up.

**Example code**

I’ve concluded that this scrolling API is largely useless. First it’s vertical only, not horizontal. Additionally, the screen doesn’t have any extra display memory so you can’t draw offscreen and then scroll it into view.  Instead you need to scroll first and then draw into the newly exposed area.  This **does** work, but because displayio doesn’t know about it all of the coordinates of everything in your scene will be messed up. That means you have to draw to the screen directly with your own code, which sort of defeats the purpose of having this cool gfx api to begin with.  I was able to make it work by creating a bitmap the same size of the screen and updating just exposed parts of the bitmap on scroll.  Essentially this turns bitmap into a simple immediate mode API.  By itself bitmap can only set pixels for fill, but with bitmaptools  we can do fast copies from other bitmaps (possibly fonts), as well as draw lines or even do alpha compositing. But again, we do all the drawing on our own. There’s no way to scroll in, say, an adafruit.Label.

Due to the limitations of vertical scrolling I’ve decided not to pursue it further. Instead I’ll focus on other speedups.


For my watch project I also want a zooming space field screen.  Rather than scrolling the stars come from the middle of the screen and accelerate outwards.  The stars are a single pixel each, so theoretically 20 stars would involve at most 40 pixels of data per frame (for erasing and then drawing again). In practice it was still slow. Why?

The displayio classes can auto-redraw only the changed parts of the by tracking dirty regions. However, the bitmap only has a **single** dirty area. If you set three pixels it will calculate the smallest rectangle that holds all three pixels.  That means if the pixels are far apart (as in my space sim) then the dirty area will include a lot of dead space in-between. Wasted bandwidth.

To fix this I turned off auto refresh and then manually refresh the display after **each particle** is draw, rather than after all of them are drawn. For most stars this results in a tiny dirty area, usually just a few pixels.  With that change I can now get 200 particles running at once on a 240x240 SPI display while keeping a respectable frame rate. Again, I’m treating the bitmap like it’s an immediate mode API, just as I would on a desktop computer that didn’t have a GPU.










