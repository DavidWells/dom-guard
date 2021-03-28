# DOM Guard

Stop scammers from the manipluating DOM.

## About

Scammers are using dev tools to manipulate values in pages to trick unsuspecting victims into sending them money. These victims are typically the elderly.

They connect to their victim's machines via remote desktop software under the guise of tech support or some other well known company.

The scammer then attempts to convince the victim they have received a larger than expected "refund" by manipulating the victim's bank user interface via chrome dev tools with the goal of getting the victim to mail them cash.

See this video for [how the refund scams work](https://www.youtube.com/watch?v=J4mkZU2Y0as).

DOMGuard is a small javascript snippet & proof of concept to help put an end to these criminals.

## Install

```bash
npm install dom-guard
```

## Usage

```js
import DOMGuard from 'dom-guard'

const guard = new DOMGuard({
  selector: '#protected', // DOM Selector to protect
  heartbeat: 1000 // Check for manipulation every 1 second
})

// Initialize DOMGuard on the #protected selector
guard.init()

// Turn off guard
guard.disable()
```

## Running the demo

```bash
npm install
npm run build
npm run serve
```

## Caveats

Please note, there isn't a foolproof solution for stopping social engineering attacks against your users.

Please educate your users on the dangers of these scams & add 2FA etc into your apps.