Unlock.me - Backend
===

## Dev environment

### pre-requisites

- bash
- docker

### Start external components

Run `./bin/dev.sh` to start/create postgres container.

### CLI command

Run `npm run dev -- <controller> <method> [data]`
to run command once.

Run `npm run watch -- <controller> <method> [data]`
to run command everytime a file in src/ or config/ is saved.
