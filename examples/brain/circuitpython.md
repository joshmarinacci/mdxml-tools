# CircuitPython


## Useful Links

* [Memory saving tips for CircuitPython](https://learn.adafruit.com/Memory-saving-tips-for-CircuitPython?view=all)

## Installation and Setup
### Install Python

MacOS instructions

Python on Mac is a pain because there are so many different ways to do it. I've found that
`pyenv` is the best way to manage python versions on MacOS

```shell
# install pyenv
brew install pyenv pyenv-virtualenv

# list all available python variants
pyenv install -l

# install latest 3.x.x python
pyenv install 3 

# add to the shell
echo 'PATH=$(pyenv root)/shims:$PATH' >> ~/.zshrc
````

Now restart your shell / open a new terminal window. 

You can manage python with these commands:

* See the current global version: `pyenv versions`
* See where the current python versions come from: `pyenv versions`
* See what is the current local version: `pyenv local`
* Set the current local version to 3.13.1: `pyenv local 3.13.1`

### Install `circup`

```shell
pip install setuptools
pip install circup
circup --version
```

### `circup` commands

* List all out of date modules: `circup list`
* update all out of date modules: `circup update`
* install a new module: `circup install <module_name>`
* show `circup show`

### PyCharm Setup

Under **Project Settings** / **Python interpreter** click the **+** button to
install new packages. Install `circuitpython-stubs`, and then the
libraries you are using. common ones include:

* adafruit-circuitpython-connectionmanager
* adafruit-circuitpython-requests
* adafruit-circuitpython-ntp


Full details [here](https://learn.adafruit.com/welcome-to-circuitpython/pycharm-and-circuitpython).


# Specific Devices

## LilyGo T-Deck

### Install firmware

The T-Deck firmware can be downloaded from [the usual location](https://circuitpython.org/board/lilygo_tdeck/) but it cannot enter bootloader mode as a USB drive like
most other devices. Instead you must install CircuitPython using WebSerial, which only
works in Chrome. 

To install it, go to [the CircuitPython download page](https://circuitpython.org/board/lilygo_tdeck/) in Chrome and click
the **Open Installer** button. A dialog will appear. Select 'Upgrade CircuitPython 9.2.1 Bin Only', 
choose the device in the Chrome web-serial port selection dialog, and follow the prompts. This will
download and reflash the device. Then turn the device on and off with the power switch and it should 
boot up with the usual CIRCUITPY drive.





Get input events

```python
import time
import tdeck

while True:
    time.sleep(0.01)
    keypress = tdeck.get_keypress()
    if keypress:
        print("keypress-", keypress)
     for p, c in tdeck.get_trackball():
        if c > 0:
            print(f"{p}: {c}")
```

## Waveshare round 1.28 LCD RP2040

The [Waveshare round 1.28 LCD](https://github.com/joshmarinacci/waveshare_lcd_test) is a set
of cheap devices which run CircuitPython and have a USB connection. They have a lot
of power in a tiny formfactor.

### Code

* my module [waveshare128.py](https://github.com/joshmarinacci/waveshare_lcd_test/blob/main/waveshare128.py) to expose all waveshare specific functions
* my [example code](https://github.com/joshmarinacci/waveshare_lcd_test) to show off using touch and other functions
* another [device repo](https://github.com/aedile/circuit_python_wsRP2040128/tree/main) for the waveshare

### Boot

Hold down the __boot__ button on the back of the device while plugging in the USB-C cable to your laptop. 

### Display

To access the display you need to install `gc9a01`, a separate driver library, with
`circup install gc9a01` then initialize it. Note that the touch and non-touch versions
are slightly different.  On the non-touch version reset is set to `LCD_RST`. On the touch version it is Pin 13 (`board.GP13`), so initialize it like this:

```python
spi = busio.SPI(clock=board.LCD_CLK, MOSI=board.LCD_DIN)
# LCD_RST is 12 in regular version
# but we need 13 for the touch version
display_bus = displayio.FourWire(spi, 
   command=board.LCD_DC, 
   chip_select=board.LCD_CS,
   reset=board.GP13)
display = gc9a01.GC9A01(display_bus, 
   width=240, 
   height=240, 
   backlight_pin=board.LCD_BL)
```

## Sharp Memory display

Assuming the display is connected to the standard SPI connections on an RP2040

```python
displayio.release_displays()
bus = busio.SPI(board.SCK, MOSI=board.MOSI)
chip_select_pin = board.D25
framebuffer = sharpdisplay.SharpMemoryFramebuffer(bus, chip_select_pin, width=144, height=168)
display = framebufferio.FramebufferDisplay(framebuffer)
display.root_group = displayio.CIRCUITPYTHON_TERMINAL
while True:
    print("hello")
    pass
```

## QT Py (not the rp2040 version)

* [learn page](https://learn.adafruit.com/adafruit-qt-py)
* get into boot loader mode with double click on the reset button.
* asyncio is not supported on SAMD21 boards due to lack of storage and RAM.

## KB2040:
* [learn page](https://learn.adafruit.com/adafruit-kb2040)
* [pinout PDF](https://github.com/adafruit/Adafruit-KB2040-PCB/blob/main/Adafruit%20KB2040%20Pinout.pdf)
* [CircuitPython firmware download](https://circuitpython.org/board/adafruit_kb2040/)
* It does support AsyncIO.
*



### reference board pins by string name


```python
pin = board.D0 
# or
pin = getattr(board,'D0')
```

## MagTag





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


# APIs

## USB

### RP2040 with USB Host

```python
usb_host.Port(board.USB_HOST_DATA_PLUS, board.USB_HOST_DATA_MINUS)
if supervisor.runtime.usb_connected:
    print("USB<host>!")
else:
    print("!USB<host>")

while True:
    print(sys.stdin.read(1))
```

### Scan for devices on USB host

```python
while True:
    print("searching for devices")
    for device in usb.core.find(find_all=True):
        print("pid", hex(device.idProduct))
        print("vid", hex(device.idVendor))
        print("man", device.manufacturer)
        print("product", device.product)
        print("serial", device.serial_number)
        print("config[0]:")
        config_descriptor = adafruit_usb_host_descriptors.get_configuration_descriptor(
            device, 0
        )

        i = 0
        while i < len(config_descriptor):
            descriptor_len = config_descriptor[i]
            descriptor_type = config_descriptor[i + 1]
            if descriptor_type == adafruit_usb_host_descriptors.DESC_CONFIGURATION:
                config_value = config_descriptor[i + 5]
                print(f" value {config_value:d}")
            elif descriptor_type == adafruit_usb_host_descriptors.DESC_INTERFACE:
                interface_number = config_descriptor[i + 2]
                interface_class = config_descriptor[i + 5]
                interface_subclass = config_descriptor[i + 6]
                print(f" interface[{interface_number:d}]")
                print(
                    f"  class {interface_class:02x} subclass {interface_subclass:02x}"
                )
            elif descriptor_type == adafruit_usb_host_descriptors.DESC_ENDPOINT:
                endpoint_address = config_descriptor[i + 2]
                if endpoint_address & DIR_IN:
                    print(f"  IN {endpoint_address:02x}")
                else:
                    print(f"  OUT {endpoint_address:02x}")
            i += descriptor_len
        print()
    time.sleep(5)
```

## Network

### list wifi

```python
for network in wifi.radio.start_scanning_networks():
    print(f"{network.ssid} [Ch:{network.channel}] RSSI: {network.rssi}")
```

### connect to wifi

```python
wifi.radio.connect(ssid, password)
```

### fetch HTTP request

```python
# Initalize Wifi, Socket Pool, Request Session
pool = adafruit_connection_manager.get_radio_socketpool(wifi.radio)
ssl_context = adafruit_connection_manager.get_radio_ssl_context(wifi.radio)
requests = adafruit_requests.Session(pool, ssl_context)

with requests.get("http://webpage.site") as response:
    print(response.text)
```

[CircuitPython Tricks](https://github.com/todbot/circuitpython-tricks)

### get the network time

```python

# specific to the MatrixPortal M4
pool = adafruit_connection_manager.get_radio_socketpool(matrix.network._wifi.esp)
# most modern boards
pool = adafruit_connection_manager.get_radio_socketpool(wifi.radio),

# get the time
ntp = adafruit_ntp.NTP(socketpool=pool)

# print the time
print(ntp.datetime)

```

## Files

### Load JSON from disk

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

## Graphics

Everything graphics in CircuitPython is built around the displayio library.

* [API docs](https://docs.circuitpython.org/en/latest/shared-bindings/displayio/)
* [Official Adafruit Tutorial](https://learn.adafruit.com/circuitpython-display-support-using-displayio/introduction)

### display graphics

First you need a display object, which is usually preconfigured for your board if it
has a built in display, as `board.display`. It will automatically refresh the screen.
The root of the screengraph should already be set to a group, so you can `append` to it.

```python
display = board.display
display.root_group.append(some_gfx_object)
```

### text and labels

create a new text label:

```python
label = label.Label(
    font=terminalio.FONT,
    text="Greetings Earthlings",
    x=20,
    y=10,
)
display.root_group.append(label)
```

### Fonts


#### use a custom font in a label or button

[Overview | Custom Fonts for CircuitPython Displays | Adafruit Learning System](https://learn.adafruit.com/custom-fonts-for-pyportal-circuitpython-display/overview)

Convert  truetype font to bitmap

```shell
brew install otf2bdf
otf2bdf FontFile.ttf -p pointsize -o FontFile.bdf
```

convert bitmap ascii to bitmap binary
[bdftopcf font converter](https://adafruit.github.io/web-bdftopcf/)

Use in python code

```python
from adafruit_display_text import label
from adafruit_bitmap_font import bitmap_font

font = bitmap_font.load_font("my_font.bdf")
# draw in red
text_label = label.Label(font, text="Greetings Earthling!", color=0xFF0000)
```



### Bitmaps

#### Empty bitmap for drawing

A bitmap is just an empty image. It has a fixed size and number of colors. Pixels
can be set directly using `x,y` coordinates.

```python
import displayio


bitmap = displayio.Bitmap(32,32,2)
palette = displayio.Palette(2)
palette[0] = 0x000000
palette[1] = 0xffffff

# set pixel at x=3, y=4 to color 1
bitmap[3,4] = 1
```

Bitmaps can only be shown on screen using a tilegrid.  To create a tilegrid that shows
the bitmap without any repetition, do:

```python
tilegrid = displayio.TileGrid(bitmap, pixel_shader=palette)
display.root_group.append(tilegrid)
```

#### convert a PNG to a indexed color bitmap

```shell
convert digits.png -colors 64 -type palette -compress None BMP3:digits.bmp
```





### Terminal
The `terminalio.Terminal` class implements a traditional 'terminal' with VT100 control codes.
It does this by giving you a stream you can print to. It converts the stream of characters
into a tilegrid using the bitmap font. It will wrap lines if necessary. Unfortunately it only
supports a single color at a time. Multi-colored text isn't supported.

```python
import terminalio
import displayio

# size of each font glyph (this is a monospaced font)
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

## Dates and Times

print datetime in isoformat

```python
timestamp.isoformat()

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














