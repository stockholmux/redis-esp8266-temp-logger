# Redis IoT Temperature Logger

This package is a web dashboard for a temperature logging circuit based on the ESP8266 MCU. It's a support repo for the article [Ice wine, Redis and Microcontrollers](#).

## Running
You will need to configure your Redis client connection information as a JSON file and pass it into the script via an argument (`--credentials`). It should then be accessible at `http://localhost:4999`


## ESP8266
The code for the MCU itself can be found on [this Arduino ESP8266 sketch](https://gist.github.com/stockholmux/92c8f6c0e5f0c8ce67a73dce84ccc9d1).